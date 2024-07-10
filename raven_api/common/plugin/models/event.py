from datetime import UTC, datetime
from traceback import print_exc
from typing import Any, Literal, Type, TypeVar
from uuid import uuid4
from pydantic import BaseModel
from litestar import Litestar

TEvent = TypeVar("TEvent", bound="BaseEvent")


class EventRegistry:
    def __init__(self):
        self._events: dict[str, Type["BaseEvent"]] = {}

    @property
    def events(self) -> dict[str, Type["BaseEvent"]]:
        return self._events.copy()

    def register(self, path: str):
        def register_inner(cls: Type[TEvent]):
            self._events[path] = cls
            return cls

        return register_inner

    def make_emitter(self, app: Litestar, listener: str = "core", source: str = "core"):
        def emit(path: str, data: dict[str, Any]) -> None:
            try:
                event = self.events.get(path, None)
                if event:
                    event_obj = event(
                        id=uuid4().hex,
                        source=source,
                        path=path,
                        emitted=datetime.now(UTC),
                        **data
                    )
                    app.emit(listener, event=event_obj, app=app)
            except:
                print_exc()

        return emit


EVENTS = EventRegistry()


class BaseEvent(BaseModel):
    id: str = None
    path: str
    source: Literal["core"] | str = None
    emitted: datetime = None


@EVENTS.register("resource.update")
class ResourceUpdateEvent(BaseEvent):
    path: Literal["resource.update"] = "resource.update"
    entity_id: str


EVENT_TYPES = ResourceUpdateEvent
