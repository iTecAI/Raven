from litestar import Litestar, get
from datetime import datetime


@get("/")
async def get_root() -> datetime:
    return datetime.now()


app = Litestar(route_handlers=[get_root])
