from litestar import Controller, get, post
from pydantic import BaseModel
from ..common.models import Session, User, RedactedUser, Config, Scope
from ..util import guard_logged_in, provide_user, Context
from litestar.exceptions import NotFoundException, MethodNotAllowedException
from litestar.di import Provide


class UserSpecModel(BaseModel):
    username: str
    password: str


class AuthController(Controller):
    path = "/auth"

    @post("/login")
    async def login(
        self, session: Session, data: UserSpecModel, config: Config
    ) -> RedactedUser:
        user = await User.from_username(data.username)
        if not user:
            raise NotFoundException("Unknown username/password")
        if not user.verify(data.password):
            raise NotFoundException("Unknown username/password")

        if user.admin and not config.auth.admin.enabled:
            raise NotFoundException("Unknown username/password")

        session.user_id = user.id
        await session.save()
        return user.redacted

    @post("/create")
    async def create_user(self, session: Session, data: UserSpecModel) -> RedactedUser:
        user = await User.from_username(data.username)
        if user:
            raise MethodNotAllowedException("User already exists.")

        new_user = User.create(data.username, data.password)
        await new_user.save()
        session.user_id = new_user.id
        await session.save()
        return new_user.redacted

    @post("/logout", guards=[guard_logged_in])
    async def logout(self, session: Session) -> None:
        session.user_id = None
        await session.save()

    @get(path="/scopes", guards=[guard_logged_in])
    async def get_scopes(self, context: Context) -> dict[str, Scope]:
        return context.scopes
