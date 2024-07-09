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
    categories: str | list[str] | None = None
    tags: list[str | list[str]] | str | None = None
    id: str | list[str] | None = None
    fragment: dict | None = None

    def matches(self, target: Resource, match_none=False) -> bool:
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
                    if not any(
                        [i == target.metadata.category for i in self.categories]
                    ):
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
    options: list[str] = []
    multiple: bool = False


class ArrayArgument(ExecArgument):
    type: Literal["array"] = "array"
    max_values: int | None = None
    suggestions: list[str] | None = None


class ResourceArgument(ExecArgument):
    type: Literal["resource"] = "resource"
    targets: list[ExecutionTarget] | None = None


ExecArguments = (
    BooleanArgument
    | StringArgument
    | NumberArgument
    | ObjectArgument
    | SelectionArgument
    | ArrayArgument
    | ResourceArgument
)


class Executor(BaseModel):
    id: str
    plugin: str
    export: str
    name: str
    description: str | None = None
    targets: list[ExecutionTarget] = []
    arguments: dict[str, ExecArguments] = {}


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
