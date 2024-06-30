from typing import Any


class LifecycleContext:
    def __init__(self):
        self.context: dict[tuple[str, str], Any] = {}

    def register(self, plugin: str, key: str, value: Any):
        if (plugin, key) in self.context.keys():
            raise ValueError(f"Duplicate context key detected: {plugin}.{key}")

        self.context[(plugin, key)] = value

    def get[T](self, plugin: str, key: str, value_type: T = Any) -> T | None:
        return self.context.get((plugin, key), None)
