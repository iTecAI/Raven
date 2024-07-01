from ..context import Context, Config, LifecycleContext, PluginLoader
from litestar.datastructures import State


async def provide_context(state: State) -> Context:
    return state.context


async def provide_config(context: Context) -> Config:
    return context.config


async def provide_lifcycle(context: Context) -> LifecycleContext:
    return context.lifecycle


async def provide_plugins(context: Context) -> PluginLoader:
    return context.plugins
