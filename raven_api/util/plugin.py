from asyncio import Task, TaskGroup, create_task
from contextlib import asynccontextmanager
import json
from logging import Logger
import os
from traceback import print_exc
from types import ModuleType
from typing import Any, Callable, ItemsView, Literal, Type, TypedDict
from h11 import Event
from litestar import Litestar
from pydantic import BaseModel
from ..common.plugin import (
    PluginManifest,
    LifecycleExport,
    LifecycleContext,
    EXPORTS,
    ResourceExport,
    Resource,
    ExecutionManager,
    Executor,
    EVENT_TYPES,
    EVENTS,
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


class Plugin:
    def __init__(self, record: PluginRecord, loader: "PluginLoader"):
        self._record = record
        self.loader = loader

    @property
    def folder(self) -> str:
        return self._record["folder"]

    @property
    def manifest(self) -> PluginManifest:
        return self._record["manifest"]

    @property
    def module(self) -> ModuleType:
        return self._record["module"]

    def exports(
        self, *types: Literal["resource", "lifecycle", "executor", "event"]
    ) -> dict[str, EXPORTS]:
        return {
            k: v
            for k, v in self.manifest.exports.items()
            if len(types) == 0 or v.type in types
        }

    def get_export(self, key: str) -> EXPORTS | None:
        return self.manifest.exports.get(key, None)

    def resolve_export[T](self, key: str, _exported: Type[T] = None) -> T | None:
        result = self.get_export(key)
        if result:
            try:
                return result.resolve(self.module)
            except:
                return None
        return None

    async def get_resources(self) -> list[Resource]:
        resource_exports = self.exports("resource")
        results = []
        for export_key, export in resource_exports.items():
            resource_function = self.resolve_export(export_key)
            if resource_function:
                kwargs = {
                    k: self.loader.lifecycle.get(self.manifest.slug, v)
                    for k, v in export.kwargs.items()
                }
                if export.is_async:
                    results.extend(await resource_function(**kwargs))
                else:
                    results.extend(resource_function(**kwargs))
        return results

    @property
    def execution_managers(self) -> list[ExecutionManager]:
        constructors: dict[str, Type[ExecutionManager]] = {
            export: self.resolve_export(export, _exported=ExecutionManager)
            for export in self.exports("executor").keys()
        }

        result = []
        for export, constructor in constructors.items():
            kwargs = {
                k: self.loader.lifecycle.get(self.manifest.slug, v)
                for k, v in self.manifest.exports.get(export).kwargs.items()
            }
            result.append(constructor(export, **kwargs))
        return result

    async def get_executors_for_resources(
        self, targets: list[Resource]
    ) -> list[Executor]:
        tasks: list[Task] = []

        async def exec_one(
            manager: ExecutionManager, targets: list[Resource]
        ) -> list[Executor]:
            try:
                return await manager.get_executors(targets)
            except:
                print_exc()
                return []

        async with TaskGroup() as group:
            for manager in self.execution_managers:
                tasks.append(group.create_task(exec_one(manager, targets)))

        results = []
        for task in tasks:
            results.extend(task.result())

        return results

    async def get_possible_executor_targets(self, executor: Executor) -> list[Resource]:
        tasks: list[Task] = []

        async def exec_one(
            manager: ExecutionManager, executor: Executor
        ) -> list[Resource]:
            try:
                return await manager.get_available_targets(executor)
            except:
                return []

        async with TaskGroup() as group:
            for manager in self.execution_managers:
                tasks.append(group.create_task(exec_one(manager, executor)))

        results = []
        for task in tasks:
            results.extend(task.result())

        return results

    async def call_executor(
        self,
        executor: Executor,
        arguments: dict[str, Any],
        target: Resource,
    ) -> None:
        for manager in self.execution_managers:
            if manager.export == executor.export:
                try:
                    return await manager.execute(executor, arguments, target)
                except:
                    return None
        return None

    async def activate_listeners(self, app: Litestar) -> list[Task]:
        listeners = self.exports("event")
        tasks = []
        for export_key, export in listeners.items():
            listener = self.resolve_export(export_key)
            kwargs = {
                k: self.loader.lifecycle.get(self.manifest.slug, v)
                for k, v in export.kwargs.items()
            }
            tasks.append(
                create_task(
                    listener(
                        emit=EVENTS.make_emitter(
                            app, source=self.manifest.slug + ":" + export_key
                        ),
                        **kwargs,
                    )
                )
            )

        return tasks


class PluginLoader:

    def __init__(self, config: Config, logger: Logger):
        self.config = config
        self.logger = logger
        self.lifecycle = LifecycleContext()
        self._plugins = self._load_plugins()

    @property
    def manifests(self) -> list[PluginManifest]:
        return [i["manifest"] for i in self._plugins.values()]

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

                    if self.config.dev.plugin_dep_install:
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
        for plugin in self._plugins.values():
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
    def plugins(self) -> dict[str, Plugin]:
        return {k: Plugin(v, self) for k, v in self._plugins.items()}

    def get(self, key: str) -> Plugin | None:
        record = self._plugins.get(key, None)
        return Plugin(record, self) if record else None

    def items(self) -> ItemsView[str, Plugin]:
        return self.plugins.items()

    def keys(self) -> list[str]:
        return list(self._plugins.keys())

    @asynccontextmanager
    async def event_listeners(self, app: Litestar):
        tasks: list[Task] = []
        for plugin in self.plugins.values():
            tasks.extend(await plugin.activate_listeners(app))

        try:
            yield
        finally:
            for task in tasks:
                task.cancel()
