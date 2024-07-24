from typing import Any, Literal
from uuid import uuid4
from litestar import Controller, delete, get, post
from litestar.di import Provide
from litestar.exceptions import *
from pydantic import BaseModel
from ..util import (
    guard_logged_in,
    guard_scoped,
    provide_user,
    provide_event_emitter,
    EmitterType,
)
from ..common.models import (
    PipelineIO,
    PipelineDataIO,
    PipelineTriggerIO,
    PipelineIOTypes,
)


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
    label: str | None = None


class PipelineIOController(Controller):
    path = "/pipelines/io"
    guards = [guard_scoped("pipelines.io*"), guard_logged_in]
    dependencies = {"user": Provide(provide_user)}

    @get("/")
    async def get_ios(self) -> list[PipelineIO]:
        return await PipelineIO.all(with_children=True).to_list()

    @get("/triggers")
    async def get_io_triggers(self) -> list[PipelineTriggerIO]:
        return await PipelineTriggerIO.all().to_list()

    @get("/data")
    async def get_io_datas(self) -> list[PipelineDataIO]:
        return await PipelineDataIO.all().to_list()

    @get("/{io_id:str}")
    async def get_io_by_id(self, io_id: str) -> PipelineIOTypes:
        result = await PipelineIO.get(io_id, with_children=True)
        if not result:
            raise NotFoundException("Unknown IO ID")
        return result

    @post(
        "/triggers",
        guards=[guard_scoped("pipelines.io.manage")],
        dependencies={"emitter": Provide(provide_event_emitter())},
    )
    async def create_io_trigger(
        self, data: TriggerIOModel, emitter: EmitterType
    ) -> PipelineTriggerIO:
        try:
            created = PipelineTriggerIO(**data.model_dump())
            await created.save()
            emitter("pipeline.io.edit", {}, scopes=["pipelines.io.*"])
            return created
        except:
            raise ValidationException("Failed to parse into IO model")

    @post(
        "/data",
        guards=[guard_scoped("pipelines.io.manage")],
        dependencies={"emitter": Provide(provide_event_emitter())},
    )
    async def create_io_data(
        self, data: DataIOModel, emitter: EmitterType
    ) -> PipelineDataIO:
        try:
            created = PipelineDataIO(**data.model_dump())
            await created.save()
            emitter("pipeline.io.edit", {}, scopes=["pipelines.io.*"])
            return created
        except:
            raise ValidationException("Failed to parse into IO model")

    @post(
        "/{io_id:str}/edit",
        guards=[guard_scoped("pipelines.io.manage")],
        dependencies={"emitter": Provide(provide_event_emitter())},
    )
    async def edit_io_item(
        self, data: dict, io_id: str, emitter: EmitterType
    ) -> PipelineIOTypes:
        to_edit: PipelineIOTypes | None = await PipelineIO.get(
            io_id, with_children=True
        )
        if not to_edit:
            raise NotFoundException("Unknown IO ID")

        model: PipelineIOTypes
        match data["type"]:
            case "data":
                model = PipelineDataIO(**data)
            case "trigger":
                model = PipelineTriggerIO(**data)
            case _:
                raise ClientException(f"Invalid IO type: {data['type']}")

        if model.type != to_edit.type:
            raise ClientException("IO type mismatch")

        model.id = to_edit.id
        await model.save()
        emitter("pipeline.io.edit", {}, scopes=["pipelines.io.*"])
        return model

    @delete(
        "/{io_id:str}",
        guards=[guard_scoped("pipelines.io.manage")],
        dependencies={"emitter": Provide(provide_event_emitter())},
    )
    async def delete_io_item(self, io_id: str, emitter: EmitterType) -> None:
        io_obj = await PipelineIO.get(io_id, with_children=True)
        if io_obj == None:
            raise NotFoundException("Unknown IO ID")
        await io_obj.delete()
        emitter("pipeline.io.edit", {}, scopes=["pipelines.io.*"])

    @post(
        "/{io_id:str}/copy",
        guards=[guard_scoped("pipelines.io.manage")],
        dependencies={"emitter": Provide(provide_event_emitter())},
    )
    async def duplicate_io_item(
        self, io_id: str, emitter: EmitterType
    ) -> PipelineIOTypes:
        io_obj = await PipelineIO.get(io_id, with_children=True)
        if io_obj == None:
            raise NotFoundException("Unknown IO ID")
        io_obj.id = uuid4().hex
        io_obj.name += " Copy"
        await io_obj.save()
        emitter("pipeline.io.edit", {}, scopes=["pipelines.io.*"])
        return io_obj

    @post(
        "/{io_id:str}/activate",
        guards=[guard_scoped("pipelines.io.activate")],
        dependencies={"emitter": Provide(provide_event_emitter())},
    )
    async def activate_io_item(
        self, io_id: str, emitter: EmitterType, data: Any
    ) -> PipelineIOTypes:
        io_obj: PipelineIOTypes | None = await PipelineIO.get(io_id, with_children=True)
        if io_obj == None:
            raise NotFoundException("Unknown IO ID")

        match io_obj.type:
            case "data":
                if not isinstance(data, dict):
                    raise ValidationException("Invalid activation body")
                for field in io_obj.fields:
                    if field.key in data.keys():
                        field.value = data[field.key]
                await io_obj.save()
            case "trigger":
                pass

        emitter(
            "pipeline.io.activate",
            {"io_type": io_obj.type, "io_id": io_id},
            scopes=["pipelines.io"],
        )
        return io_obj
