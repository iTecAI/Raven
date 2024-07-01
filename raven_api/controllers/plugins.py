from litestar import Controller, get
from litestar.exceptions import *
from ..common.plugin import PluginManifest
from ..util import PluginLoader


class PluginsController(Controller):
    path = "/plugins"

    @get("/")
    async def list_plugins(self, plugins: PluginLoader) -> list[PluginManifest]:
        return plugins.manifests

    @get("/{plugin_name:str}")
    async def get_plugin(
        self, plugins: PluginLoader, plugin_name: str
    ) -> PluginManifest:
        if plugin_name in plugins.plugins.keys():
            return plugins.plugins[plugin_name]["manifest"]
        raise NotFoundException
