from contextlib import asynccontextmanager
import json
from logging import Logger
import os
from traceback import print_exc
from types import ModuleType
from typing import Any, Callable, TypedDict
from pydantic import BaseModel
from ..common.plugin import (
    PluginManifest,
    LifecycleExport,
    LifecycleContext,
    EXPORTS,
    ResourceExport,
)
from ..common.models import Config
import importlib.util
import sys
import subprocess


class LifecycleRecord(TypedDict):
    module: ModuleType
    plugin: PluginManifest
    export: LifecycleExport
    settings: dict


@asynccontextmanager
async def nest_lifecycle(context: LifecycleContext, lifecycles: list[LifecycleRecord]):
    current = lifecycles[0]
    remaining = lifecycles[1:]

    current_export = current["export"].resolve(current["module"])
    if current["export"].is_async:
        async with current_export(current["settings"]) as current_context:
            context.register(
                current["plugin"].slug, current["export"].context_key, current_context
            )
            if len(remaining) > 0:
                async with nest_lifecycle(context, remaining) as _:
                    yield context
            else:
                yield context
    else:
        with current_export(current["settings"]) as current_context:
            context.register(
                current["plugin"].slug, current["export"].context_key, current_context
            )
            if len(remaining) > 0:
                async with nest_lifecycle(context, remaining) as _:
                    yield context
            else:
                yield context


class PluginRecord(TypedDict):
    folder: str
    manifest: PluginManifest
    module: ModuleType


class PluginLoader:

    def __init__(self, config: Config, logger: Logger):
        self.config = config
        self.logger = logger
        self.lifecycle = LifecycleContext()
        self.plugins = self._load_plugins()

    @property
    def manifests(self) -> list[PluginManifest]:
        return [i["manifest"] for i in self.plugins.values()]

    def _load_plugins(self) -> dict[str, PluginRecord]:
        self.logger.info("Loading plugins...")
        manifests: dict[str, PluginRecord] = {}
        for folder in os.listdir("plugins"):
            self.logger.debug(f"Checking folder {folder}")
            if os.path.isdir(os.path.join("plugins", folder)):
                if os.path.exists(os.path.join("plugins", folder, "manifest.json")):
                    try:
                        with open(
                            os.path.join("plugins", folder, "manifest.json"), "r"
                        ) as manifest_json:
                            manifest = PluginManifest(**json.load(manifest_json))
                    except:
                        raise RuntimeError(
                            f"Failed to load plugin manifest in folder {folder}"
                        )

                    self.logger.debug(f"Loaded plugin manifest for {manifest.slug}")

                    deps = [i.ref for i in manifest.dependencies]
                    self.logger.debug(
                        f"Installing plugin dependencies: [{', '.join(deps)}]"
                    )
                    subprocess.run(
                        [sys.executable, "-m", "pip", "install", *deps],
                        check=True,
                        capture_output=True,
                    )

                    spec = importlib.util.spec_from_file_location(
                        f"raven_plugins.{manifest.slug}",
                        os.path.join("plugins", folder, manifest.entrypoint),
                    )
                    plugin_module = importlib.util.module_from_spec(spec)
                    sys.modules[f"raven_plugins.{manifest.slug}"] = plugin_module
                    spec.loader.exec_module(plugin_module)
                    manifests[manifest.slug] = {
                        "module": plugin_module,
                        "folder": folder,
                        "manifest": manifest,
                    }

        return manifests

    @asynccontextmanager
    async def resolve_lifecycle(self):
        lifecycle_records: list[LifecycleRecord] = []
        for plugin in self.plugins.values():
            for export in plugin["manifest"].exports.values():
                if export.type == "lifecycle":
                    lifecycle_records.append(
                        {
                            "export": export,
                            "module": plugin["module"],
                            "plugin": plugin["manifest"],
                            "settings": self.config.plugins.get(
                                plugin["manifest"].slug, {}
                            ),
                        }
                    )

        async with nest_lifecycle(self.lifecycle, lifecycle_records) as context:
            yield context

    @property
    def exports(self) -> dict[tuple[str, str], EXPORTS]:
        results = {}
        for plugin in self.plugins.values():
            for export_name, export_data in plugin["manifest"].exports.items():
                results[(plugin["manifest"].slug, export_name)] = export_data
        return results

    def resources(self, plugin_name: str) -> dict[str, ResourceExport]:
        return {
            k[1]: v
            for k, v in self.exports.items()
            if k[0] == plugin_name and v.type == "resource"
        }

    def resolve_export(self, plugin_name: str, export: EXPORTS) -> Any:
        return export.resolve(self.plugins[plugin_name]["module"])

    async def call_resource(
        self, plugin_name: str, export_name: str, exported: Callable
    ) -> Any:
        resource = self.resources(plugin_name).get(export_name, None)
        if not resource:
            raise KeyError
        kwargs = {
            k: self.lifecycle.get(plugin_name, v) for k, v in resource.kwargs.items()
        }
        if resource.is_async:
            return await exported(**kwargs)
        return exported(**kwargs)
