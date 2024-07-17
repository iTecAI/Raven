from .base import BaseObject
from ..plugin import (
    ResourceProperty,
    Resource,
    Executor,
    ExecArgument,
    ExecutionTarget,
    ResourceMetadata,
)
from pydantic import BaseModel


class CustomResourceExecutor(BaseModel):
    id: str
    name: str
    description: str | None = None
    arguments: dict[str, ExecArgument] = {}

    def as_executor(self) -> Executor:
        return Executor(
            id=self.id,
            plugin="INTERNAL",
            export="INTERNAL",
            name=self.name,
            description=self.description,
            targets=[ExecutionTarget(id=self.id)],
            arguments=self.arguments,
        )


class CustomResource(BaseObject):
    class Settings:
        name = "resources.custom"

    resource_id: str
    name: str
    icon: str | None = None
    category: str | None = None
    tags: list[str] = []
    default_key: str
    properties: dict[str, ResourceProperty] = {}
    executors: dict[str, CustomResourceExecutor] = {}

    def as_resource(self) -> Resource:
        return Resource(
            id=self.resource_id,
            plugin="INTERNAL",
            metadata=ResourceMetadata(
                display_name=self.name,
                icon=self.icon,
                category=self.category,
                tags=self.tags,
            ),
            state_key=self.default_key,
            properties=self.properties,
        )

    def get_executors(self) -> list[Executor]:
        return [i.as_executor() for i in self.executors.values()]
