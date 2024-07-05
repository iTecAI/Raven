from .session_middleware import get_session_from_connection
from litestar.exceptions import *
from litestar.connection import ASGIConnection
from litestar.handlers.base import BaseRouteHandler


async def guard_logged_in(connection: ASGIConnection, _: BaseRouteHandler) -> None:
    session = await get_session_from_connection(connection)
    if not session.user_id:
        raise NotAuthorizedException("This endpoint requires login.")


def guard_scoped(*scopes: list[str], all: bool = False):
    async def guard_scoped_inner(
        connection: ASGIConnection, _: BaseRouteHandler
    ) -> None:
        session = await get_session_from_connection(connection)
        if not session.user_id:
            raise NotAuthorizedException("This endpoint requires login.")
        user = await session.user()
        if not user.has_scope(*scopes, all=all):
            raise NotAuthorizedException(
                "Insufficient permissions to access this endpoint"
            )
