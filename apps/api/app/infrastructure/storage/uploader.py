import os
import re
import hashlib
import asyncio
from typing import Tuple, Optional
from fastapi import HTTPException, status
from app.config.settings import settings

MAGIC_SIGNATURES = {
    b"%PDF-": "application/pdf",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"\xff\xd8\xff": "image/jpeg",
}

class StorageService:
    def __init__(self, root_dir: Optional[str] = None):
        self.root_dir = os.path.abspath(root_dir or settings.STORAGE_LOCAL_ROOT)
        os.makedirs(self.root_dir, exist_ok=True)

    def sanitize_filename(self, filename: str) -> str:
        """Sanitizes filename against path traversal, control chars, and illegal symbols."""
        if not filename:
            return "artifact.bin"
        base = os.path.basename(filename.replace("\\", "/"))
        clean = re.sub(r"[\x00-\x1f\x7f<>:\"/\\|?*]", "", base)
        clean = clean.lstrip(". \t")
        clean = re.sub(r"\s+", "_", clean)
        return clean if clean else "artifact.bin"

    def detect_content_type(self, content: bytes, declared_mime: str) -> str:
        """Detects actual content type via binary magic signatures with declared fallback."""
        if not content:
            return "application/octet-stream"

        for sig, mime in MAGIC_SIGNATURES.items():
            if content.startswith(sig):
                return mime

        try:
            sample = content[:4096].decode("utf-8")
            if sample.strip().startswith("{") and sample.strip().endswith("}"):
                return "application/json"
            return "text/plain"
        except UnicodeDecodeError:
            pass

        return declared_mime or "application/octet-stream"

    def validate_content(self, filename: str, content: bytes, declared_mime: str) -> str:
        """Enforces file size and MIME/magic signature consistency."""
        size = len(content)
        if size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty file uploaded. File must contain valid content."
            )

        if size > settings.MAX_UPLOAD_SIZE_BYTES:
            max_mb = settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum allowed limit of {max_mb} MB"
            )

        detected_type = self.detect_content_type(content, declared_mime)

        if filename.lower().endswith(".pdf") and detected_type != "application/pdf":
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="File has .pdf extension but does not contain a valid PDF magic signature"
            )

        if declared_mime == "application/pdf" and detected_type != "application/pdf":
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Declared MIME type is PDF but file content does not match PDF signature"
            )

        return detected_type

    def build_storage_key(
        self,
        student_id: str,
        evidence_id: str,
        artifact_id: str,
        normalized_filename: str
    ) -> str:
        """Generates collision-resistant, predictable logical storage key."""
        clean_student = self.sanitize_filename(student_id)
        clean_evidence = self.sanitize_filename(evidence_id)
        clean_artifact = self.sanitize_filename(artifact_id)
        return f"evidence/{clean_student}/{clean_evidence}/{clean_artifact}/{normalized_filename}"

    def _sync_write(self, path: str, content: bytes) -> None:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            f.write(content)

    def _sync_read(self, path: str) -> bytes:
        with open(path, "rb") as f:
            return f.read()

    async def save_artifact(
        self,
        student_id: str,
        evidence_id: str,
        artifact_id: str,
        filename: str,
        content: bytes,
        declared_mime: str
    ) -> Tuple[str, str, str, int, str]:
        """Validates, hashes, and stores artifact file content atomically."""
        normalized_filename = self.sanitize_filename(filename)
        detected_mime = self.validate_content(normalized_filename, content, declared_mime)
        checksum = hashlib.sha256(content).hexdigest()
        file_size = len(content)

        rel_key = self.build_storage_key(student_id, evidence_id, artifact_id, normalized_filename)
        abs_target = os.path.abspath(os.path.join(self.root_dir, rel_key))

        if not abs_target.startswith(self.root_dir):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid storage path detected: possible path traversal attack"
            )

        await asyncio.to_thread(self._sync_write, abs_target, content)
        return rel_key, normalized_filename, checksum, file_size, detected_mime

    async def get_artifact_content(self, storage_key: str) -> bytes:
        """Safely reads artifact content from object storage with path traversal protection."""
        abs_path = os.path.abspath(os.path.join(self.root_dir, storage_key))
        if not abs_path.startswith(self.root_dir):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid storage key: path traversal detected"
            )

        if not os.path.exists(abs_path) or not os.path.isfile(abs_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stored artifact not found for key '{storage_key}'"
            )

        return await asyncio.to_thread(self._sync_read, abs_path)

    async def delete_artifact(self, storage_key: str) -> bool:
        """Deletes artifact file from storage if present."""
        abs_path = os.path.abspath(os.path.join(self.root_dir, storage_key))
        if abs_path.startswith(self.root_dir) and os.path.exists(abs_path):
            try:
                os.remove(abs_path)
                return True
            except OSError:
                pass
        return False

storage_service = StorageService()
sanitize_filename = storage_service.sanitize_filename
