import asyncio
from litestar import Controller, get
from ..util import (
    guard_logged_in,
    PluginLoader,
    Plugin,
    PluginManifest,
    provide_user,
    guard_scoped,
)
from ..common.plugin import Resource
from ..common.models import User
from litestar.exceptions import *
from litestar.di import Provide


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
