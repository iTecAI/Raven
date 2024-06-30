from contextlib import asynccontextmanager
import json
import os
from traceback import print_exc
from types import ModuleType
from typing import TypedDict
from pydantic import BaseModel
from ..common.plugin import PluginManifest, LifecycleExport, LifecycleContext
from ..common.models import Config
import importlib.util
import sys


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

    def __init__(self, config: Config):
        self.config = config
        self.lifecycle = LifecycleContext()
        self.manifests = self._load_plugins()

    def _load_plugins(self) -> dict[str, PluginRecord]:
        manifests: dict[str, PluginRecord] = {}
        for folder in os.listdir("plugins"):
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
        for plugin in self.manifests.values():
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
