from typing import Any
from ..common.models import Config
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

    @property
    def lifecycle(self) -> LifecycleContext:
        return self.plugins.lifecycle
