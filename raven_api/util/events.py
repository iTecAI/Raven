from litestar.events import listener
from litestar import Litestar
from ..common.plugin import EVENT_TYPES


@listener("core")
async def listen_core_events(event: EVENT_TYPES = None, app: Litestar = None) -> None:
    app.logger.info(event.model_dump_json())
