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


class AuthAdminConfig(BaseModel):
    enabled: bool = False
    username: str | None = None
    password: str | None = None


class AuthConfig(BaseModel):
    admin: AuthAdminConfig | None = None


class DevConfig(BaseModel):
    plugin_dep_install: bool = True


class Config(BaseModel):
    storage: StorageConfig
    plugins: dict[str, dict] = {}
    logging: LoggingConfig = LoggingConfig()
    auth: AuthConfig = AuthConfig()
    dev: DevConfig = DevConfig()
