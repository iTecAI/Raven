from typing import Any, Literal
from litestar import Controller, get, post
from litestar.di import Provide
from litestar.exceptions import *
from pydantic import BaseModel
from ..util import guard_logged_in, guard_scoped, provide_user
from ..common.models import PipelineIO, PipelineDataIO, PipelineTriggerIO


class DataIOModel(BaseModel):
    type: Literal["data"]
    name: str
    icon: str | None = None
    description: str | None = None
    fields: list[dict[str, Any]] = []


class TriggerIOModel(BaseModel):
    type: Literal["trigger"]
    name: str
    icon: str | None = None
    description: str | None = None


class PipelineIOController(Controller):
    path = "/pipelines/io"
    guards = [guard_scoped("pipelines.*"), guard_logged_in]
    dependencies = {"user": Provide(provide_user)}

    @get("/")
    async def get_ios(self) -> list[PipelineIO]:
        return await PipelineIO.all().to_list()

    @get("/triggers")
    async def get_io_triggers(self) -> list[PipelineTriggerIO]:
        return await PipelineTriggerIO.all().to_list()

    @get("/data")
    async def get_io_datas(self) -> list[PipelineDataIO]:
        return await PipelineDataIO.all().to_list()

    @get("/{io_id:str}")
    async def get_io_by_id(self, io_id: str) -> PipelineIO:
        result = await PipelineIO.get(io_id)
        if not result:
            raise NotFoundException("Unknown IO ID")
        return result

    @post("/triggers", guards=[guard_scoped("pipelines.manage")])
    async def create_io_trigger(self, data: TriggerIOModel) -> PipelineTriggerIO:
        try:
            created = PipelineTriggerIO(**data.model_dump())
            await created.save()
            return created
        except:
            raise ValidationException("Failed to parse into IO model")

    @post("/data", guards=[guard_scoped("pipelines.manage")])
    async def create_io_trigger(self, data: DataIOModel) -> PipelineDataIO:
        try:
            created = PipelineDataIO(**data.model_dump())
            await created.save()
            return created
        except:
            raise ValidationException("Failed to parse into IO model")
