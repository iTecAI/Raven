from litestar import Router, get
from ..common.models import Session, AuthState
from .auth import AuthController, AuthScopesController
from .plugins import PluginsController
from .resources import ResourceController
from .events import EventController

CONTROLLERS = [
    AuthController,
    AuthScopesController,
    PluginsController,
    ResourceController,
    EventController,
]

@get("/")
async def get_root(session: Session) -> AuthState:
    return await session.get_authstate()


API_ROUTER = Router(path="/api", route_handlers=[*CONTROLLERS, get_root])
