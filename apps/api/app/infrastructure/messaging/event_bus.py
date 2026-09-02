import logging
import asyncio
from typing import Callable, Dict, List

logger = logging.getLogger("skillsetu.events")

class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}

    def subscribe(self, event_name: str, handler: Callable):
        if event_name not in self._subscribers:
            self._subscribers[event_name] = []
        self._subscribers[event_name].append(handler)

    async def publish(self, event_name: str, payload: dict):
        logger.info(f"Event published: {event_name}")
        handlers = self._subscribers.get(event_name, [])
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(payload)
                else:
                    handler(payload)
            except Exception as e:
                logger.error(f"Error handling event {event_name}: {e}")

event_bus = EventBus()
