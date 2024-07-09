import asyncio
from typing import Any
from litestar import Controller, get, post
from pydantic import BaseModel
from ..util import (
    guard_logged_in,
    PluginLoader,
    Plugin,
    PluginManifest,
    provide_user,
    guard_scoped,
)
from ..common.plugin import Resource, Executor, ExecutionTarget, match_execution_targets
from ..common.models import User
from litestar.exceptions import *
from litestar.di import Provide


class ExecutionModel(BaseModel):
    target: Resource
    executor: Executor
    args: dict[str, Any]


class ResourceController(Controller):
    path = "/resources"
    guards = [guard_logged_in, guard_scoped("resources.*")]
    dependencies = {"user": Provide(provide_user)}

    @get("/")
    async def get_resources(self, user: User, plugins: PluginLoader) -> list[Resource]:
        scoped_all = user.has_scope("resources.all.*")
        tasks = []

        async with asyncio.TaskGroup() as group:
            for plugin in plugins.plugins.values():
                if not scoped_all:
                    if not user.has_scope(f"resources.plugin.{plugin.manifest.slug}.*"):
                        continue
                tasks.append(group.create_task(plugin.get_resources()))

        results = []
        for t in tasks:
            results.extend(t.result())
        return results

    @post(
        "/executors",
        guards=[guard_scoped("resources.all.execute", "resources.plugin.*.execute")],
    )
    async def get_executors_for_resources(
        self, user: User, plugins: PluginLoader, data: list[Resource]
    ) -> list[Executor]:
        scoped_all = user.has_scope("resources.all.execute")
        tasks = []

        async with asyncio.TaskGroup() as group:
            for plugin in plugins.plugins.values():
                if not scoped_all:
                    if not user.has_scope(
                        f"resources.plugin.{plugin.manifest.slug}.execute"
                    ):
                        continue
                tasks.append(
                    group.create_task(plugin.get_executors_for_resources(data))
                )

        results = []
        for t in tasks:
            results.extend(t.result())
        return results

    @post("/filtered")
    async def get_filtered(
        self,
        user: User,
        plugins: PluginLoader,
        data: Any,
    ) -> list[Resource]:
        scoped_all = user.has_scope("resources.all.*")
        tasks = []

        async with asyncio.TaskGroup() as group:
            for plugin in plugins.plugins.values():
                if not scoped_all:
                    if not user.has_scope(f"resources.plugin.{plugin.manifest.slug}.*"):
                        continue
                tasks.append(group.create_task(plugin.get_resources()))

        results = []
        for t in tasks:
            results.extend(t.result())

        return [i for i in results if match_execution_targets(data, i)]

    @post(
        "/execute",
        guards=[guard_scoped("resources.all.execute", "resources.plugin.*.execute")],
    )
    async def execute_on_resource(
        self, user: User, plugins: PluginLoader, data: ExecutionModel
    ) -> None:
        if user.has_scope(
            "resources.all.execute", f"resources.plugin.{data.executor.plugin}.execute"
        ):
            plugin = plugins.get(data.executor.plugin)
            await plugin.call_executor(data.executor, data.args, data.target)
            return None
        raise NotAuthorizedException("Insufficient scope to execute")
