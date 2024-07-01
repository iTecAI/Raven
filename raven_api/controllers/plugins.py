from typing import Any
from litestar import Controller, get
from litestar.exceptions import *
from ..common.plugin import PluginManifest, LifecycleContext
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

    @get("/{plugin_name:str}/resources/{export_name:str}")
    async def get_resources(
        self,
        plugins: PluginLoader,
        lifecycle: LifecycleContext,
        plugin_name: str,
        export_name: str,
    ) -> Any:
        export = plugins.resources(plugin_name).get(export_name)
        if not export:
            raise NotFoundException
        resolved = plugins.resolve_export(plugin_name, export)
        return await plugins.call_resource(plugin_name, export_name, resolved)
