from typing import Generic, TypeVar, Type, Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.infrastructure.database.session import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get_by_id(self, id: Any) -> Optional[ModelType]:
        result = await self.db.execute(select(self.model).where(self.model.id == id))
        return result.scalars().first()

    async def list_all(self, limit: int = 100, offset: int = 0) -> List[ModelType]:
        result = await self.db.execute(select(self.model).offset(offset).limit(limit))
        return list(result.scalars().all())

    async def create(self, entity: ModelType) -> ModelType:
        self.db.add(entity)
        await self.db.flush()
        return entity

    async def update(self, entity: ModelType) -> ModelType:
        await self.db.flush()
        return entity

    async def delete_by_id(self, id: Any) -> bool:
        entity = await self.get_by_id(id)
        if entity:
            await self.db.delete(entity)
            await self.db.flush()
            return True
        return False
