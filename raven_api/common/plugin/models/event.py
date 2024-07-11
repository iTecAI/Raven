from datetime import UTC, datetime
from traceback import print_exc
from typing import Any, ClassVar, Literal, Type, TypeVar
from uuid import uuid4
from pydantic import BaseModel, computed_field
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

        def emit(
            path: str,
            data: dict[str, Any],
            scopes: list[str] | Literal["global"] = "global",
        ) -> None:
            try:
                event = self.events.get(path, None)
                if event:
                    event_obj = event(
                        id=uuid4().hex,
                        source=source,
                        path=path,
                        emitted=datetime.now(UTC),
                        scope=scopes,
                        **data
                    )
                    app.emit(listener, event=event_obj, app=app)
            except:
                print_exc()

        return emit

    def __call__(self, data: dict[str, Any]) -> "EVENT_TYPES | None":
        if "path" in data.keys():
            if data["path"] in self.events.keys():
                try:
                    return self.events[data["path"]](**data)
                except:
                    return None
        return None


EVENTS = EventRegistry()


class BaseEvent(BaseModel):
    id: str = None
    path: str
    source: Literal["core"] | str = None
    scope: list[str] | Literal["global"] = "global"
    emitted: datetime = None

    @property
    def is_global(self) -> bool:
        return self.scope == "global"


@EVENTS.register("resource.update")
class ResourceUpdateEvent(BaseEvent):
    path: Literal["resource.update"] = "resource.update"
    entity_id: str


EVENT_TYPES = ResourceUpdateEvent
