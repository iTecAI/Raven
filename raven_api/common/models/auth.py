from datetime import datetime, UTC
from passlib.hash import argon2
from beanie import ValidateOnSave, before_event
from pydantic import BaseModel
from .base import BaseObject
from .scope import Scope, DEFAULT_SCOPES


class RedactedUser(BaseModel):
    id: str
    username: str
    admin: bool
    scopes: list[str]


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

    async def user(self) -> "User | None":
        if self.user_id:
            return await User.get(self.user_id)
        return None

    async def get_authstate(self) -> "AuthState":
        user = await self.user()
        return AuthState(session=self, user=user.redacted if user else None)


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

    def has_scope(self, *scopes: Scope | str, all: bool = False) -> bool:
        if self.admin:
            return True
        matched = 0
        scope_paths = [
            (i.path if isinstance(i, Scope) else i).split(".") for i in scopes
        ]
        for path in scope_paths:
            if path[-1] == "*":
                if any(
                    [
                        i.split(".")[: len(path) - 1] == path[: len(path) - 1]
                        for i in self.scopes
                    ]
                ):
                    matched += 1
                    if not all:
                        return True
            else:
                if any(
                    [".".join(path[:i]) in self.scopes for i in range(1, len(path) + 1)]
                ):
                    matched += 1
                    if not all:
                        return True
        if matched == len(scopes):
            return True
        return False


class AuthState(BaseModel):
    session: Session
    user: RedactedUser | None
