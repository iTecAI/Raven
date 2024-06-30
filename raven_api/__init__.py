from contextlib import asynccontextmanager
import logging
import tomllib
from typing import AsyncGenerator
from litestar import Litestar, get
from datetime import datetime
from .common.models import Config
from .util import PluginLoader, Context
from redis.asyncio import Redis
from litestar.channels import ChannelsPlugin
from litestar.channels.backends.redis import RedisChannelsPubSubBackend
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from litestar.datastructures import State

with open("./config.toml", "rb") as config_file:
    CONFIG = Config(**tomllib.load(config_file))

REDIS = Redis(host=CONFIG.storage.redis.url)


@asynccontextmanager
async def app_lifecycle(app: Litestar) -> AsyncGenerator[None, None]:

    plugins = PluginLoader(CONFIG)
    async with plugins.resolve_lifecycle() as lifecycle:
        mongo_client = AsyncIOMotorClient(CONFIG.storage.mongo.url)
        await init_beanie(database=CONFIG.storage.mongo.database, document_models=[])
        context = Context(
            CONFIG,
            plugins,
            REDIS,
            mongo_client.get_database(CONFIG.storage.mongo.database),
        )
        app.state["context"] = context
        yield


@get("/")
async def get_root() -> datetime:
    return datetime.now()


app = Litestar(
    route_handlers=[get_root],
    lifespan=[app_lifecycle],
    plugins=[
        ChannelsPlugin(
            RedisChannelsPubSubBackend(redis=REDIS),
            arbitrary_channels_allowed=True,
            create_ws_route_handlers=True,
            ws_handler_base_path="/api/events",
        )
    ],
    state=State({}),
)
