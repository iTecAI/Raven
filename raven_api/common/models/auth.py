from datetime import datetime, UTC
from passlib.hash import argon2
from beanie import ValidateOnSave, before_event
from .base import BaseObject


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


class User(BaseObject):
    username: str
    password: str

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
