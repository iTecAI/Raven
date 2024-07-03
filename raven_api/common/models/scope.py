from typing import TypedDict
from pydantic import BaseModel, computed_field


class MinimalScope(TypedDict):
    display_name: str
    children: dict[str, "MinimalScope"]


class Scope(BaseModel):
    id: str
    parent: str | None = None
    display_name: str | None = None
    children: dict[str, "Scope"] = {}

    def __getitem__(self, key: str) -> "Scope":
        return self.children[key]

    def add_scope(self, path: str, scope: "Scope", _child: bool = False):
        if not _child:
            scope.parent = path
        if path == "":
            self.children[scope.id] = scope
        elif "." in path:
            key, remainder = path.split(".", maxsplit=1)
            self.children[key].add_scope(remainder, scope, _child=True)
        else:
            self.children[path].add_scope("", scope, _child=True)

    @property
    def root(self) -> bool:
        return self.id == "root"

    @computed_field
    @property
    def path(self) -> str:
        if self.parent:
            return ".".join([self.parent, self.id])
        else:
            return self.id

    @classmethod
    def from_spec(
        cls, spec: dict[str, MinimalScope], _path: str | None = None
    ) -> "Scope":
        base = Scope(id="root")
        for k, v in spec.items():
            new_scope = Scope.from_spec(
                v.get("children", {}), ".".join([_path, k]) if _path else k
            )
            new_scope.id = k
            new_scope.parent = _path
            new_scope.display_name = v.get("display_name", None)

            base.children[k] = new_scope

        return base


CORE_SCOPE: dict[str, MinimalScope] = {
    "admin": {
        "display_name": "Administration",
        "children": {
            "users": {
                "display_name": "User Management",
                "children": {
                    "view": {
                        "display_name": "View",
                        "children": {
                            "basic": {"display_name": "Basic"},
                            "groups": {"display_name": "Groups"},
                            "scopes": {"display_name": "Scopes"},
                        },
                    },
                    "manage": {
                        "display_name": "Manage",
                        "children": {
                            "create": {"display_name": "Create"},
                            "delete": {"display_name": "Delete"},
                            "edit": {
                                "display_name": "Edit",
                                "children": {
                                    "basic": {"display_name": "Basic"},
                                    "groups": {"display_name": "Groups"},
                                    "scopes": {"display_name": "Scopes"},
                                },
                            },
                        },
                    },
                },
            }
        },
    },
    "resources": {
        "display_name": "Resources",
        "children": {
            "all": {
                "display_name": "All Resources",
                "children": {
                    "view": {"display_name": "View"},
                    "execute": {"display_name": "Execute"},
                },
            },
            "plugin": {"display_name": "Plugin-Specific"},
        },
    },
    "pipelines": {
        "display_name": "Pipelines",
        "children": {
            "view": {"display_name": "View"},
            "manage": {"display_name": "Manage"},
        },
    },
}
