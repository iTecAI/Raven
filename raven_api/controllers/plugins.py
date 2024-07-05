from litestar import Controller, get
from ..util import guard_logged_in, PluginLoader, Plugin, PluginManifest
from litestar.exceptions import *


class PluginsController(Controller):
    path = "/plugins"
    guards = [guard_logged_in]

    @get("/")
    async def get_plugins(self, plugins: PluginLoader) -> dict[str, PluginManifest]:
        return {k: v.manifest for k, v in plugins.items()}

    @get("/{plugin_name:str}")
    async def get_plugin(
        self, plugins: PluginLoader, plugin_name: str
    ) -> PluginManifest:
        result = plugins.get(plugin_name)
        if not result:
            raise NotFoundException(f"Unknown plugin {[plugin_name]}")
        return result.manifest
