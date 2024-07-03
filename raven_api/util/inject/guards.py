from .session_middleware import get_session_from_connection
from litestar.exceptions import *
from litestar.connection import ASGIConnection
from litestar.handlers.base import BaseRouteHandler


async def guard_logged_in(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    session = await get_session_from_connection(connection)
    if not session.user_id:
        raise NotAuthorizedException("This endpoint required login.")
