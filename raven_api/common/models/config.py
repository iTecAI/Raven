from pydantic import BaseModel


class StorageMongoConfig(BaseModel):
    url: str
    database: str


class StorageRedisConfig(BaseModel):
    url: str


class StorageConfig(BaseModel):
    mongo: StorageMongoConfig
    redis: StorageRedisConfig


class Config(BaseModel):
    storage: StorageConfig
    plugins: dict[str, dict] = {}
