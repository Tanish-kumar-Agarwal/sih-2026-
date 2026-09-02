import os
import uuid
import aiofiles
from fastapi import UploadFile

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class StorageService:
    async def save_file(self, file: UploadFile) -> str:
        ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
        unique_name = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)
        
        async with aiofiles.open(file_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)
            
        return f"/uploads/{unique_name}"

storage_service = StorageService()
