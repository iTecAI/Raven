from inspect import ismodule
from types import ModuleType
from typing import Literal
from pydantic import BaseModel

class PluginDependency(BaseModel):
    name: str
    ref: str
    source: Literal["git", "pip"] | None = None
    cache: bool = False


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


EXPORTS = LifecycleExport

class PluginManifest(BaseModel):
    slug: str
    name: str
    description: str | None = None
    icon: str | None = None
    dependencies: list[PluginDependency] = []
    module: str
    exports: dict[str, EXPORTS] = {}
