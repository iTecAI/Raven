from typing import Any
from ..common.models import Config, Scope, CORE_SCOPE
from ..common.plugin import LifecycleContext
from .plugin import PluginLoader
from redis.asyncio import Redis
from motor.motor_asyncio import AsyncIOMotorDatabase


class Context:
    def __init__(
        self,
        config: Config,
        plugins: PluginLoader,
        redis: Redis,
        mongodb: AsyncIOMotorDatabase,
    ):
        self.config = config
        self.plugins = plugins
        self.redis = redis
        self.mongodb = mongodb
        self.scope = Scope.from_spec(CORE_SCOPE)

        for plugin_key, plugin in self.plugins.items():
            self.scope.add_scope(
                f"resources.plugin",
                Scope(
                    id=plugin_key,
                    parent="resources.plugin",
                    display_name=plugin.manifest.name,
                ),
            )

    @property
    def lifecycle(self) -> LifecycleContext:
        return self.plugins.lifecycle

    @property
    def scopes(self) -> dict[str, Scope]:
        return self.scope.children
