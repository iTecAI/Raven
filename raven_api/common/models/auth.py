from datetime import datetime, UTC
from passlib.hash import argon2
from beanie import ValidateOnSave, before_event, Delete
from pydantic import BaseModel
from .base import BaseObject
from .scope import Scope, DEFAULT_SCOPES


def glob_match(check: str, matches: list[str]) -> list[str]:
    check_parts = check.split(".")
    results = []
    for match in matches:
        parts = match.split(".")
        is_candidate = True
        for i in range(len(parts)):
            if i >= len(check_parts):
                if check_parts[-1] != "*":
                    is_candidate = False
                    break
            else:
                if check_parts[i] == parts[i] or check_parts[i] == "*":
                    pass
                else:
                    is_candidate = False
                    break

        if is_candidate:
            results.append(match)

    return results


class RedactedUser(BaseModel):
    id: str
    username: str
    admin: bool
    scopes: list[str]


class EventContext(BaseObject):
    session_id: str
    subscriptions: list[str] = []

    class Settings:
        name = "auth.session.subscriptions"


class Session(BaseObject):
    user_id: str | None = None
    last_request: datetime

    class Settings:
        name = "auth.session"

    @classmethod
    def create(cls) -> "Session":
        return Session(last_request=datetime.now(UTC))

    @before_event(ValidateOnSave)
    def update_rq(self):
        self.last_request = datetime.now(UTC)

    @before_event(Delete)
    async def remove_event_ctx(self):
        await EventContext.find({"session_id": self.id}).delete()

    async def user(self) -> "User | None":
        if self.user_id:
            return await User.get(self.user_id)
        return None

    async def get_authstate(self) -> "AuthState":
        user = await self.user()
        return AuthState(session=self, user=user.redacted if user else None)

    async def get_event_context(self) -> EventContext:
        existing = await EventContext.find_one({"session_id": self.id})
        if not existing:
            ctx = EventContext(session_id=self.id)
            await ctx.save()
            return ctx
        return existing


class User(BaseObject):
    username: str
    password: str
    admin: bool = False
    scopes: list[str] = []

    class Settings:
        name = "auth.user"

    @classmethod
    def create(cls, username: str, password: str) -> "User":
        return User(
            username=username, password=argon2.hash(password), scopes=DEFAULT_SCOPES
        )

    @classmethod
    async def from_username(cls, username: str) -> "User | None":
        return await cls.find_one(User.username == username)

    async def sessions(self) -> list[Session]:
        return await Session.find(Session.user_id == self.id).to_list()

    def verify(self, password: str) -> bool:
        return argon2.verify(password, self.password)

    @property
    def redacted(self) -> RedactedUser:
        return RedactedUser(
            id=self.id, username=self.username, admin=self.admin, scopes=self.scopes
        )

    def check_scope(self, *scopes: Scope | str) -> dict[str, bool]:
        scope_paths = [i.path if isinstance(i, Scope) else i for i in scopes]
        if self.admin:
            return {path: True for path in scope_paths}

        result = {}
        for check in scope_paths:
            result[check] = glob_match(check, self.scopes)

        return result

    def has_scope(self, *scopes: Scope | str, match_all: bool = False) -> bool:
        matched = self.check_scope(*scopes)
        if match_all:
            return all(matched.values())
        else:
            return any(matched.values())


class AuthState(BaseModel):
    session: Session
    user: RedactedUser | None
