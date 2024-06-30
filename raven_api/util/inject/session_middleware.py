from datetime import UTC, datetime
from ...common.models import Session
from litestar.datastructures import MutableScopeHeaders
from litestar.types import Message, Receive, Scope, Send
from litestar.connection import ASGIConnection
from litestar.middleware.base import MiddlewareProtocol
from litestar.types import ASGIApp


class CookieSessionManager(MiddlewareProtocol):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            connection = ASGIConnection(scope, receive=receive, send=send)
            active_token = (
                await Session.get(connection.cookies.get("tokens.raven"))
                if "tokens.raven" in connection.cookies.keys()
                else None
            )
            if active_token:
                scope["token"] = active_token
                await active_token.save()
            else:
                new_session = Session.create()
                await new_session.save()
                scope["token"] = new_session

            async def send_wrapper(message: Message) -> None:
                if message["type"] == "http.response.start":
                    headers = MutableScopeHeaders.from_message(message=message)
                    headers["Set-Cookie"] = f"tokens.raven={scope['token'].id}"
                await send(message)

            await self.app(scope, receive, send_wrapper)
        else:
            await self.app(scope, receive, send)


async def provide_session(scope: Scope) -> Session:
    return scope["token"]


async def get_session_from_connection(connection: ASGIConnection) -> Session:
    return connection.scope["token"]
