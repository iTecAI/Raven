from enum import StrEnum
from typing import Any
from pydantic import BaseModel


class ResourcePropertyType(StrEnum):
    OBJECT = "object"
    TEXT = "text"
    NUMBER = "number"
    DATE = "date"
    TIME = "time"
    DATETIME = "datetime"
    COLOR = "color"
    OPTION = "option"
    LIST = "list"


class ResourceProperty[T](BaseModel):
    label: str | None = None
    type: ResourcePropertyType
    value: T
    icon: str | None = None
    suffix: str | None = None
    prefix: str | None = None


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
