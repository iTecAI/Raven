from typing import Literal
from pydantic import BaseModel

class PluginDependency(BaseModel):
    name: str
    ref: str
    source: Literal["git", "pip"] | None = None
    cache: bool = False


class PluginManifest(BaseModel):
    slug: str
    name: str
    description: str | None = None
    icon: str | None = None
    dependencies: list[PluginDependency] = []