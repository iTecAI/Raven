from datetime import datetime, UTC
from passlib.hash import argon2
from beanie import ValidateOnSave, before_event
from pydantic import BaseModel
from .base import BaseObject


class RedactedUser(BaseModel):
    id: str
    username: str
    admin: bool


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

    class Settings:
        name = "auth.user"

    @classmethod
    def create(cls, username: str, password: str) -> "User":
        return User(username=username, password=argon2.hash(password))

    @classmethod
    async def from_username(cls, username: str) -> "User | None":
        return await cls.find_one(User.username == username)

    async def sessions(self) -> list[Session]:
        return await Session.find(Session.user_id == self.id).to_list()

    def verify(self, password: str) -> bool:
        return argon2.verify(password, self.password)

    @property
    def redacted(self) -> RedactedUser:
        return RedactedUser(id=self.id, username=self.username, admin=self.admin)


class AuthState(BaseModel):
    session: Session
    user: RedactedUser | None
