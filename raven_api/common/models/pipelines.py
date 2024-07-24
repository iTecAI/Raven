from datetime import date, datetime, time
import re
from typing import Annotated, Any, Literal, Type

from pydantic import BaseModel, Field, computed_field
from .base import BaseObject
import colorsys


class PipelineField[T](BaseModel):
    key: str
    label: str
    type: None = None
    val: T | None = None
    default_value: T | None = None

    @computed_field
    @property
    def value(self) -> T | None:
        if self.val == None:
            return self.default_value
        return self.val

    def validate(self, value: T | None) -> bool:
        return True

    @value.setter
    def value(self, val: T | None) -> None:
        if self.validate(val):
            self.val = val
        else:
            self.val = None


class StringField(PipelineField[str]):
    type: Literal["string"] = "string"
    multiline: bool = False
    max_length: int | None = None

    def validate(self, value: str | None) -> bool:
        return (type(value) == str or value == None) and (
            self.max_length == None or len(value) <= self.max_length
        )


class NumberField(PipelineField[int | float]):
    type: Literal["number"] = "number"
    decimals: bool = True
    negatives: bool = True
    min: int | float | None = None
    max: int | float | None = None

    def validate(self, value: int | float | None) -> bool:
        if type(value) in [int, float]:
            if int(value) != value and not self.decimals:
                return False

            if value < 0 and not self.negatives:
                return False

            if self.max != None and value > self.max:
                return False
            if self.min != None and value < self.min:
                return False
            return True
        else:
            return False


class SwitchField(PipelineField[bool]):
    type: Literal["switch"] = "switch"


class SelectField(PipelineField[str | list[str]]):
    type: Literal["select"] = "select"
    options: list[str | dict[Literal["label", "value"], str]] = []
    multiple: bool = False

    def validate(self, value: str | list[str] | None) -> bool:
        if isinstance(value, list) and not self.multiple:
            return False

        opts = [i["value"] if isinstance(i, dict) else i for i in self.options]
        if isinstance(value, list):
            return all([i in opts for i in value])
        else:
            return value in opts


class ListField(PipelineField[list[str]]):
    type: Literal["list"] = "list"
    suggestions: list[str] | None = None
    max_length: int | None = None

    def validate(self, value: list[str] | None) -> bool:
        if value == None:
            return True
        if isinstance(value, list):
            return self.max_length == None or len(value) <= self.max_length
        return False


class ColorField(PipelineField[str]):
    type: Literal["color"] = "color"
    alpha: bool = False

    def validate(self, value: str | None) -> bool:
        if value == None:
            return True
        if self.alpha:
            return re.fullmatch(r"^#[a-f0-9]{8}$") != None
        else:
            return re.fullmatch(r"^#[a-f0-9]{6}$") != None

    @computed_field
    @property
    def rgb(self) -> tuple[int, int, int, float] | tuple[int, int, int]:
        val = self.value
        if val == None:
            return [0, 0, 0, 0.0] if self.alpha else [0, 0, 0]

        if self.alpha:
            parts = [val[1:3], val[3:5], val[5:7], val[7:9]]
        else:
            parts = [val[1:3], val[3:5], val[5:7]]

        parts = [int(p, 16) if type(p) == str and len(p) == 2 else 0 for p in parts]
        if self.alpha and len(parts) == 4:
            parts[3] = round(parts[3] / 255, 2)

        return tuple(parts)

    @computed_field
    @property
    def hls(self) -> tuple[int, int, int, float] | tuple[int, int, int]:
        rgb = self.rgb
        if len(rgb) == 4:
            return tuple(*[int(i) for i in colorsys.rgb_to_hls(*rgb[:3])], rgb[3])
        else:
            return tuple(int(i) for i in colorsys.rgb_to_hls(*rgb))

    @computed_field
    @property
    def hsv(self) -> tuple[int, int, int, float] | tuple[int, int, int]:
        rgb = self.rgb
        if len(rgb) == 4:
            return tuple(*[int(i) for i in colorsys.rgb_to_hsv(*rgb[:3])], rgb[3])
        else:
            return tuple(int(i) for i in colorsys.rgb_to_hsv(*rgb))


class DateTimeField(PipelineField[date | datetime | time]):
    type: Literal["datetime"] = "datetime"
    mode: Literal["datetime", "date", "time"] = "datetime"

    def validate(self, value: date | datetime | time | str | int | None) -> bool:
        if value == None:
            return None

        mapping: dict[str, Type[datetime] | Type[date] | Type[time]] = {
            "datetime": datetime,
            "date": date,
            "time": time,
        }

        if type(value) == str:
            try:
                valid = mapping[self.mode].fromisoformat(value)
                return True
            except:
                return False
        if type(value) == int and self.mode in ["datetime", "date"]:
            try:
                valid = mapping[self.mode].fromtimestamp(value)
                return True
            except:
                return False

        try:
            valid = mapping[self.mode].fromisoformat(value.isoformat())
            return True
        except:
            return False


FieldTypes = (
    StringField
    | NumberField
    | SwitchField
    | SelectField
    | ListField
    | ColorField
    | DateTimeField
)


class PipelineIO(BaseObject):
    class Settings:
        name = "pipelines.io"
        is_root = True

    type: None = None
    name: str
    icon: str | None = None
    description: str | None = None


class PipelineDataIO(PipelineIO):
    type: Literal["data"] = "data"
    fields: list[Annotated[FieldTypes, Field(discriminator="type")]] = []


class PipelineTriggerIO(PipelineIO):
    type: Literal["trigger"] = "trigger"
    label: str | None = None
