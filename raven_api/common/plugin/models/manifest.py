from enum import StrEnum
from inspect import ismodule
from types import ModuleType
from typing import Any, Callable, Literal
from pydantic import BaseModel
from .executor import ExecutionManager
from .resource import ResourceResolver

class PluginDependency(BaseModel):
    name: str
    ref: str
    source: Literal["git", "pip"] | None = None


class BaseExport(BaseModel):
    type: str
    import_path: str | None = None
    member: str

    def resolve(self, base: ModuleType):
        current = base
        if self.import_path and len(self.import_path.strip(".")) > 0:
            for item in self.import_path.strip(".").split("."):
                if hasattr(current, item):
                    current = getattr(current, item)
                    if not ismodule(current):
                        raise ImportError(
                            f"Plugin export contains non-module member: {item}"
                        )
                else:
                    raise ImportError(
                        f"Plugin export references unknown submodule: {item}"
                    )
        if hasattr(current, self.member):
            return getattr(current, self.member)
        raise ImportError(
            f"Plugin has unknown exported member: {self.import_path if self.import_path else '.'}:{self.member}"
        )


class LifecycleExport(BaseExport):
    type: Literal["lifecycle"]
    context_key: str
    is_async: bool = False


class ResourceExport(BaseExport):
    type: Literal["resource"]
    kwargs: dict[str, str | Literal["config"]] = {}

    def resolve(self, base: ModuleType) -> ResourceResolver:
        return super().resolve(base)


class ExecutorExport(BaseExport):
    type: Literal["executor"]
    kwargs: dict[str, str | Literal["config"]] = {}

    def resolve(self, base: ModuleType) -> ExecutionManager:
        return super().resolve(base)


class EventExport(BaseExport):
    type: Literal["event"]
    kwargs: dict[str, str | Literal["config"]] = {}


EXPORTS = LifecycleExport | ResourceExport | ExecutorExport | EventExport

class PluginManifest(BaseModel):
    slug: str
    name: str
    description: str | None = None
    icon: str | None = None
    dependencies: list[PluginDependency] = []
    entrypoint: str
    exports: dict[str, EXPORTS] = {}
