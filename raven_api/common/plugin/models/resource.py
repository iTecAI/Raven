from enum import StrEnum
from typing import Any
from pydantic import BaseModel


class ResourcePropertyType(StrEnum):
    OBJECT = "object", 0
    TEXT = "text", 1
    NUMBER = "number", 1
    BOOLEAN = "boolean", 2
    DATE = "date", 2
    TIME = "time", 2
    DATETIME = "datetime", 2
    COLOR = "color", 2
    OPTION = "option", 2
    LIST = "list", 1

    def __new__(cls, *args, **kwds):
        obj = str.__new__(cls)
        obj._value_ = args[0]
        return obj

    def __init__(self, _: str, priority: int = 0):
        self._priority_ = priority

    def __str__(self) -> str:
        return self.value

    def __eq__(self, value: object) -> bool:
        return str(self) == str(value)

    @property
    def priority(self):
        return self._priority_


class ResourceProperty[T](BaseModel):
    label: str | None = None
    type: ResourcePropertyType
    value: T
    icon: str | None = None
    suffix: str | None = None
    prefix: str | None = None
    hidden: bool = False


class ResourceMetadata(BaseModel):
    display_name: str | None = None
    icon: str | None = None
    category: str | None = None
    tags: list[str] = []


class Resource(BaseModel):
    id: str
    plugin: str
    metadata: ResourceMetadata = ResourceMetadata()
    properties: dict[str, ResourceProperty]
    state_key: str


class ResourceResolver:
    def __init__(self, **kwargs) -> None:
        pass

    async def get_all(self) -> list[Resource]:
        return []

    async def get_one(self, id: str) -> Resource | None:
        return None
