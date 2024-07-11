from litestar.events import listener
from litestar.channels import ChannelsPlugin
from litestar import Litestar
from ..common.plugin import EVENT_TYPES


@listener("core")
async def listen_core_events(event: EVENT_TYPES = None, app: Litestar = None) -> None:
    channels = app.plugins.get(ChannelsPlugin)
    if event:
        channels.publish(event.model_dump(), "events")
