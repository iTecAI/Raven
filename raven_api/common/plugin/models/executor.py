from typing import Any, Literal
from pydantic import BaseModel, computed_field
from .resource import Resource


def match_fragment(fragment: dict, test: dict) -> bool:
    is_match = True
    for k, v in fragment.items():
        if not k in test.keys():
            is_match = False
            break
        if type(v) != type(test[k]):
            is_match = False
            break
        if type(v) == dict:
            is_match = match_fragment(v, test[k])
            if not is_match:
                break
        if type(v) == list or type(v) == tuple:
            if not all([i in test[k] for i in v]):
                is_match = False
                break
        if v != test[k]:
            is_match = False
            break

    return is_match


class ExecutionTarget(BaseModel):
    exclude: bool = False
    categories: str | list[str] | None = None
    tags: list[str | list[str]] | str | None = None
    id: str | list[str] | None = None
    fragment: dict | None = None

    def matches(self, target: Resource, match_none=False) -> bool:
        result = self._matches(target, match_none=match_none)
        if self.exclude:
            return not result
        return result

    def _matches(self, target: Resource, match_none=False) -> bool:
        target_dict = target.model_dump()
        if self.categories:
            if target.metadata.category == None:
                if not match_none:
                    return False
            else:
                if type(self.categories) == str:
                    if self.categories != target.metadata.category:
                        return False
                else:
                    if not target.metadata.category in self.categories:
                        return False

        if self.tags:
            if type(self.tags) == str:
                if not self.tags in target.metadata.tags:
                    return False
            else:
                if not any(
                    [
                        (
                            all([j in target.metadata.tags for j in i])
                            if type(i) == list
                            else i in target.metadata.tags
                        )
                        for i in self.tags
                    ]
                ):
                    return False

        if self.id:
            if type(self.id) == str:
                if self.id != target.id:
                    return False
            else:
                if not target.id in self.id:
                    return False

        if self.fragment:
            if not match_fragment(self.fragment, target_dict):
                return False

        return True


class ExecArgument(BaseModel):
    type: None
    name: str
    label: str | None = None
    description: str | None = None
    placeholder: str | None = None
    icon: str | None = None
    advanced: bool = False
    required: bool = False


class BooleanArgument(ExecArgument):
    type: Literal["boolean"] = "boolean"
    mode: Literal["checkbox", "switch"] = "switch"


class StringArgument(ExecArgument):
    type: Literal["string"] = "string"
    multiline: bool = False
    password: bool = False
    suggestions: list[str] | None = None

    @computed_field
    @property
    def mode(self) -> Literal["normal", "suggesting", "multiline", "password"]:
        if self.password:
            return "password"
        if self.multiline:
            return "multiline"
        if self.suggestions != None and len(self.suggestions) > 0:
            return "suggesting"
        return "normal"


class NumberArgument(ExecArgument):
    type: Literal["number"] = "number"
    prefix: str | None = None
    suffix: str | None = None
    min: int | float | None = None
    max: int | float | None = None
    negatives: bool = True
    decimals: bool = True
    precision: int | None = None


class ObjectArgument(ExecArgument):
    type: Literal["object"] = "object"


class SelectionArgument(ExecArgument):
    type: Literal["selection"] = "selection"
    options: list[str | dict[str, str]] = []
    multiple: bool = False


class DurationArgument(ExecArgument):
    type: Literal["duration"] = "duration"
    days: bool = False
    negatives: bool = False


class DateTimeArgument(ExecArgument):
    type: Literal["datetime"] = "datetime"
    mode: Literal["datetime", "date", "time"] = "datetime"


class ArrayArgument(ExecArgument):
    type: Literal["array"] = "array"
    max_values: int | None = None
    suggestions: list[str] | None = None


class ResourceArgument(ExecArgument):
    type: Literal["resource"] = "resource"
    targets: list[ExecutionTarget] | None = None
    multiple: bool = False


class ColorArgument(ExecArgument):
    type: Literal["color"] = "color"
    format: Literal["HEX", "HEXA", "RGB", "RGBA", "HSL", "HSLA"] = "HEXA"


class ConstantArgument(ExecArgument):
    type: Literal["constant"] = "constant"
    value: Any | None = None


ExecArguments = (
    BooleanArgument
    | StringArgument
    | NumberArgument
    | ObjectArgument
    | SelectionArgument
    | ArrayArgument
    | ResourceArgument
    | ColorArgument
    | ConstantArgument
    | DateTimeArgument
    | DurationArgument
)


class Executor(BaseModel):
    id: str
    plugin: str
    export: str
    name: str
    description: str | None = None
    targets: list[ExecutionTarget | list[ExecutionTarget]] | None = None
    arguments: dict[str, ExecArguments] = {}

    def matches_resources(self, *resources: Resource) -> bool:
        if self.targets == None:
            return True
        for resource in resources:
            if all(
                [
                    (
                        target.matches(resource)
                        if isinstance(target, ExecutionTarget)
                        else any([candidate.matches(resource) for candidate in target])
                    )
                    for target in self.targets
                ]
            ):
                return True
        return False


class ExecutionManager:
    def __init__(self, export: str, **kwargs):
        self.export = export
        self._options = kwargs

    @property
    def options(self):
        return self._options

    async def get_executors(self, targets: list[Resource]) -> list[Executor]:
        raise NotImplementedError

    async def get_available_targets(self, executor: Executor) -> list[Resource]:
        raise NotImplementedError

    async def execute(
        self, executor: Executor, arguments: dict[str, Any], target: Resource | None
    ) -> Resource | None:
        raise NotImplementedError
