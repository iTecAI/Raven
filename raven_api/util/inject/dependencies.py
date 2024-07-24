from typing import Any, Callable, Literal
from litestar import Litestar, Request
from ..context import Context, Config, LifecycleContext, PluginLoader
from ...common.models import User, Session, Scope
from litestar.datastructures import State
from litestar.exceptions import *
from ...common.plugin import EVENTS


async def provide_context(state: State) -> Context:
    return state.context


async def provide_config(context: Context) -> Config:
    return context.config


async def provide_lifcycle(context: Context) -> LifecycleContext:
    return context.lifecycle


async def provide_plugins(context: Context) -> PluginLoader:
    return context.plugins


async def provide_user(session: Session) -> User:
    if not session.user_id:
        raise NotAuthorizedException("Endpoint requires login")
    return await session.user()


async def provide_user_scopes(user: User, context: Context) -> dict[str, Scope]:
    return {scope: context.scope[scope] for scope in user.scopes}


def provide_event_emitter(source: str = "core"):
    async def make_emitter_internal(
        request: Request,
    ) -> Callable[[str, dict[str, Any], list[str] | Literal["global"]], None]:
        return EVENTS.make_emitter(request.app, source=source)

    return make_emitter_internal


EmitterType = Callable[[str, dict[str, Any], list[str] | Literal["global"]], None]
