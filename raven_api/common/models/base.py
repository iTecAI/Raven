from uuid import uuid4
from beanie import Document
from pydantic import Field


class BaseObject(Document):
    id: str = Field(default_factory=lambda: uuid4().hex)
