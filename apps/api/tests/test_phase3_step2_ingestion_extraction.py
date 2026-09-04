import io
import os
import pytest
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.config.settings import settings
from app.infrastructure.storage.uploader import storage_service, sanitize_filename
from app.infrastructure.database.models import Evidence, EvidenceArtifact, EvidenceExtraction

LIVE_SERVER_URL = "http://127.0.0.1:8000"

def get_test_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return create_async_engine(db_url, echo=False, poolclass=NullPool)

def make_sample_pdf(text_content: str = "Aarav Sharma - Distributed Systems & Database Reliability") -> bytes:
    """Creates a deterministic valid PDF binary with text."""
    pdf = (
        b"%PDF-1.4\n"
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        b"4 0 obj << /Length " + str(len(text_content) + 50).encode() + b" >> stream\n"
        b"BT\n"
        b"/F1 12 Tf\n"
        b"50 700 Td\n"
        b"(" + text_content.encode() + b") Tj\n"
        b"ET\n"
        b"endstream\n"
        b"endobj\n"
        b"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        b"xref\n"
        b"0 6\n"
        b"0000000000 65535 f \n"
        b"0000000010 00000 n \n"
        b"0000000060 00000 n \n"
        b"0000000117 00000 n \n"
        b"0000000244 00000 n \n"
        b"0000000350 00000 n \n"
        b"trailer << /Size 6 /Root 1 0 R >>\n"
        b"startxref\n"
        b"450\n"
        b"%%EOF\n"
    )
    return pdf

def make_empty_pdf() -> bytes:
    """Creates a valid PDF with an empty page (no text layer)."""
    return (
        b"%PDF-1.4\n"
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj\n"
        b"xref\n"
        b"0 4\n"
        b"0000000000 65535 f \n"
        b"0000000010 00000 n \n"
        b"0000000060 00000 n \n"
        b"0000000117 00000 n \n"
        b"trailer << /Size 4 /Root 1 0 R >>\n"
        b"startxref\n"
        b"200\n"
        b"%%EOF\n"
    )


# ==============================================================================
# 1. PATH SANITIZATION & SECURITY UNIT TESTS
# ==============================================================================

def test_sanitize_filename_prevents_directory_traversal():
    assert sanitize_filename("../../../../etc/passwd") == "passwd"
    assert sanitize_filename("..\\..\\windows\\system32\\cmd.exe") == "cmd.exe"
    assert sanitize_filename("safe_file.pdf") == "safe_file.pdf"
    assert sanitize_filename("") == "artifact.bin"
    assert sanitize_filename("   ") == "artifact.bin"


# ==============================================================================
# 2. VALID PDF INGESTION & PYMUPDF EXTRACTION
# ==============================================================================

@pytest.mark.asyncio
async def test_upload_valid_pdf_end_to_end():
    """Uploads a valid PDF, verifies storage, PyMuPDF extraction, and PostgreSQL persistence."""
    pdf_bytes = make_sample_pdf("SkillSetu Phase 3: Ingestion and Extraction Engine Verification")
    files = {"file": ("academic_transcript.pdf", pdf_bytes, "application/pdf")}
    data = {
        "title": "Semester 6 Transcript",
        "evidence_type": "DOCUMENT",
        "evidence_strength": "STRONG"
    }
    headers = {"X-Dev-Persona-Id": "stu-aarav-sharma"}

    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=15.0) as client:
        response = await client.post("/api/v1/evidence/upload", files=files, data=data, headers=headers)
        assert response.status_code == 201, f"Upload failed: {response.text}"
        payload = response.json()

        # Evidence fields
        assert payload["id"] is not None
        assert payload["title"] == "Semester 6 Transcript"
        assert payload["processing_status"] == "COMPLETED"
        assert payload["verification_status"] == "PENDING"  # INVARIANT: Decoupled!

        # Artifact fields
        assert len(payload["artifacts"]) == 1
        art = payload["artifacts"][0]
        assert art["original_filename"] == "academic_transcript.pdf"
        assert art["mime_type"] == "application/pdf"
        assert art["file_size"] == len(pdf_bytes)
        assert len(art["sha256_checksum"]) == 64
        assert art["retention_state"] == "ACTIVE"

        # Extraction fields
        assert len(art["extractions"]) == 1
        ext = art["extractions"][0]
        assert ext["extractor_name"] == "PyMuPDFExtractor"
        assert ext["extraction_status"] == "COMPLETED"
        assert ext["page_count"] == 1
        assert "SkillSetu Phase 3" in ext["raw_text"]


# ==============================================================================
# 3. OVERSIZED FILE BOUNDING (MAX 15 MB)
# ==============================================================================

@pytest.mark.asyncio
async def test_oversized_upload_rejected():
    """Rejects files exceeding MAX_UPLOAD_SIZE_BYTES with 413."""
    # Create an in-memory stream exceeding 15MB
    large_size = 16 * 1024 * 1024  # 16 MB
    large_bytes = b"%PDF-1.4\n" + (b"0" * (large_size - 9))

    files = {"file": ("giant.pdf", large_bytes, "application/pdf")}
    headers = {"X-Dev-Persona-Id": "stu-aarav-sharma"}

    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=15.0) as client:
        response = await client.post("/api/v1/evidence/upload", files=files, headers=headers)
        assert response.status_code == 413
        assert "exceeds maximum allowed" in response.text


# ==============================================================================
# 4. MIME TYPE / MAGIC BYTE VALIDATION
# ==============================================================================

@pytest.mark.asyncio
async def test_mismatched_magic_signature_rejected():
    """Rejects file with .pdf extension containing HTML or script payload."""
    fake_pdf = b"<html><script>alert('exploit')</script></html>"
    files = {"file": ("fake.pdf", fake_pdf, "application/pdf")}
    headers = {"X-Dev-Persona-Id": "stu-aarav-sharma"}

    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=15.0) as client:
        response = await client.post("/api/v1/evidence/upload", files=files, headers=headers)
        assert response.status_code == 415
        assert "magic signature" in response.text.lower()


# ==============================================================================
# 5. PATH TRAVERSAL SANITIZATION IN STORAGE
# ==============================================================================

@pytest.mark.asyncio
async def test_path_traversal_filename_sanitized():
    """Ensures malicious filenames with ../ are sanitized and stored safely."""
    pdf_bytes = make_sample_pdf("Path Traversal Safety Check")
    files = {"file": ("../../../../etc/passwd", pdf_bytes, "application/pdf")}
    headers = {"X-Dev-Persona-Id": "stu-aarav-sharma"}

    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=15.0) as client:
        response = await client.post("/api/v1/evidence/upload", files=files, headers=headers)
        assert response.status_code == 201
        payload = response.json()
        art = payload["artifacts"][0]
        assert art["normalized_filename"] == "passwd"
        assert ".." not in art["storage_key"]


# ==============================================================================
# 6. EMPTY / SCANNED PDF HANDLING
# ==============================================================================

@pytest.mark.asyncio
async def test_empty_scanned_pdf_handled_gracefully():
    """Verifies that PDFs with no selectable text are marked as EMPTY, not failing the transaction."""
    empty_pdf_bytes = make_empty_pdf()
    files = {"file": ("scanned_blank.pdf", empty_pdf_bytes, "application/pdf")}
    headers = {"X-Dev-Persona-Id": "stu-aarav-sharma"}

    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=15.0) as client:
        response = await client.post("/api/v1/evidence/upload", files=files, headers=headers)
        assert response.status_code == 201
        payload = response.json()
        ext = payload["artifacts"][0]["extractions"][0]
        assert ext["extraction_status"] == "EMPTY"
        assert ext["page_count"] == 1


# ==============================================================================
# 7. CORRUPTED PDF HANDLING
# ==============================================================================

@pytest.mark.asyncio
async def test_corrupted_pdf_handled_gracefully():
    """Verifies that a damaged PDF is recorded as status=FAILED without crashing the API."""
    corrupted_pdf = b"%PDF-1.4\nTRUNCATED_BINARY_CORRUPTED_GARBAGE_NO_XREF"
    files = {"file": ("damaged.pdf", corrupted_pdf, "application/pdf")}
    headers = {"X-Dev-Persona-Id": "stu-aarav-sharma"}

    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=15.0) as client:
        response = await client.post("/api/v1/evidence/upload", files=files, headers=headers)
        assert response.status_code == 201
        payload = response.json()
        ext = payload["artifacts"][0]["extractions"][0]
        assert ext["extraction_status"] == "FAILED"
        assert ext["error_message"] is not None


# ==============================================================================
# 8. PLAIN TEXT DOCUMENT EXTRACTION
# ==============================================================================

@pytest.mark.asyncio
async def test_plain_text_document_extraction():
    """Tests plain text / markdown document ingestion and extraction."""
    text_content = b"SkillSetu Project Architecture\nAuthored by: Aarav Sharma\nStack: Python, FastAPI, PostgreSQL"
    files = {"file": ("readme.txt", text_content, "text/plain")}
    headers = {"X-Dev-Persona-Id": "stu-aarav-sharma"}

    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=15.0) as client:
        response = await client.post("/api/v1/evidence/upload", files=files, headers=headers)
        assert response.status_code == 201
        payload = response.json()
        ext = payload["artifacts"][0]["extractions"][0]
        assert ext["extractor_name"] == "PlainTextExtractor"
        assert ext["extraction_status"] == "COMPLETED"
        assert "Aarav Sharma" in ext["raw_text"]



# ==============================================================================
# 9. STUDENT ISOLATION & DOWNLOAD ACCESS CONTROL
# ==============================================================================

@pytest.mark.asyncio
async def test_artifact_download_and_student_isolation():
    """Ensures Student B cannot download Student A's uploaded artifact, but Student A can."""
    pdf_bytes = make_sample_pdf("Confidential Aarav Evidence")
    files = {"file": ("confidential.pdf", pdf_bytes, "application/pdf")}
    headers_aarav = {"X-Dev-Persona-Id": "stu-aarav-sharma"}

    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=15.0) as client:
        # 1. Aarav uploads artifact
        upload_res = await client.post("/api/v1/evidence/upload", files=files, headers=headers_aarav)
        assert upload_res.status_code == 201
        payload = upload_res.json()
        evidence_id = payload["id"]
        artifact_id = payload["artifacts"][0]["id"]

        # 2. Priya attempts to download Aarav's artifact -> MUST BE 403 FORBIDDEN
        headers_priya = {"X-Dev-Persona-Id": "stu-priya-patel"}
        dl_res_priya = await client.get(
            f"/api/v1/evidence/{evidence_id}/artifacts/{artifact_id}/download",
            headers=headers_priya
        )
        assert dl_res_priya.status_code == 403

        # 3. Aarav downloads own artifact -> MUST BE 200 OK
        dl_res_aarav = await client.get(
            f"/api/v1/evidence/{evidence_id}/artifacts/{artifact_id}/download",
            headers=headers_aarav
        )
        assert dl_res_aarav.status_code == 200
        assert dl_res_aarav.content == pdf_bytes
        assert "attachment" in dl_res_aarav.headers.get("content-disposition", "")


# ==============================================================================
# 10. SHA-256 CHECKSUM IDENTITY & DETERMINISM
# ==============================================================================

@pytest.mark.asyncio
async def test_sha256_checksum_identity_for_duplicate_content():
    """Confirms that identical byte contents yield identical SHA-256 digests across uploads."""
    content = b"%PDF-1.4\nIdentical Payload for Deterministic Digest Testing\n%%EOF"
    files1 = {"file": ("run1.pdf", content, "application/pdf")}
    files2 = {"file": ("run2.pdf", content, "application/pdf")}
    headers = {"X-Dev-Persona-Id": "stu-aarav-sharma"}

    async with AsyncClient(base_url=LIVE_SERVER_URL, timeout=15.0) as client:
        res1 = await client.post("/api/v1/evidence/upload", files=files1, headers=headers)
        res2 = await client.post("/api/v1/evidence/upload", files=files2, headers=headers)
        assert res1.status_code == 201
        assert res2.status_code == 201
        digest1 = res1.json()["artifacts"][0]["sha256_checksum"]
        digest2 = res2.json()["artifacts"][0]["sha256_checksum"]
        assert digest1 == digest2
        assert len(digest1) == 64


# ==============================================================================
# 11. COMPENSATING PHYSICAL STORAGE CLEANUP
# ==============================================================================

@pytest.mark.asyncio
async def test_compensating_storage_cleanup():
    """Validates that storage_service can reliably delete files when compensating rollback is needed."""
    test_key, norm_name, checksum, size, mime = await storage_service.save_artifact(
        student_id="test_student",
        evidence_id="test_evidence",
        artifact_id="test_art",
        filename="test_clean.bin",
        content=b"temporary compensating test data",
        declared_mime="application/octet-stream"
    )
    # Confirm file exists and can be read
    content = await storage_service.get_artifact_content(test_key)
    assert content == b"temporary compensating test data"

    # Perform compensating cleanup
    deleted = await storage_service.delete_artifact(test_key)
    assert deleted is True

    # Verify get_artifact_content now raises 404
    with pytest.raises(Exception) as exc_info:
        await storage_service.get_artifact_content(test_key)
    assert "not found" in str(exc_info.value).lower()



