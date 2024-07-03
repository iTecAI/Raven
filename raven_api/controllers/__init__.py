from litestar import Router, get
from .plugins import PluginsController
from ..common.models import Session, AuthState
from .auth import AuthController

CONTROLLERS = [PluginsController, AuthController]


@get("/")
async def get_root(session: Session) -> AuthState:
    return await session.get_authstate()


API_ROUTER = Router(path="/api", route_handlers=[*CONTROLLERS, get_root])
