from pydantic import BaseModel
from enum import StrEnum


class LogLevel(StrEnum):
    CRITICAL = "CRITICAL"
    FATAL = CRITICAL
    ERROR = "ERROR"
    WARNING = "WARNING"
    WARN = WARNING
    INFO = "INFO"
    DEBUG = "DEBUG"
    NOTSET = "NOTSET"


class StorageMongoConfig(BaseModel):
    url: str
    database: str


class StorageRedisConfig(BaseModel):
    url: str


class StorageConfig(BaseModel):
    mongo: StorageMongoConfig
    redis: StorageRedisConfig


class LoggingConfig(BaseModel):
    level: LogLevel = LogLevel.INFO
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"


class Config(BaseModel):
    storage: StorageConfig
    plugins: dict[str, dict] = {}
    logging: LoggingConfig = LoggingConfig()
