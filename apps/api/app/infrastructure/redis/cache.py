import json
import logging
from typing import Optional, Any
from app.config.settings import settings

logger = logging.getLogger("skillsetu.redis")

class RedisCache:
    def __init__(self):
        self._cache = {}

    async def get(self, key: str) -> Optional[Any]:
        return self._cache.get(key)

    async def set(self, key: str, value: Any, expire_seconds: int = 3600):
        self._cache[key] = value

    async def delete(self, key: str):
        self._cache.pop(key, None)

cache_service = RedisCache()
