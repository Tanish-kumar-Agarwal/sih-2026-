from typing import Optional
from app.domains.evidence.extraction.base import BaseExtractor
from app.domains.evidence.extraction.pdf_extractor import PyMuPDFExtractor
from app.domains.evidence.extraction.text_extractor import PlainTextExtractor

class ExtractorResolver:
    def __init__(self):
        self.pdf_extractor = PyMuPDFExtractor()
        self.text_extractor = PlainTextExtractor()

    def resolve(self, mime_type: str, filename: str) -> Optional[BaseExtractor]:
        """Resolves the appropriate extractor based on MIME type and filename extension."""
        mime = (mime_type or "").lower()
        fn = (filename or "").lower()

        if mime == "application/pdf" or fn.endswith(".pdf"):
            return self.pdf_extractor

        if (
            mime.startswith("text/")
            or mime == "application/json"
            or fn.endswith((".txt", ".md", ".json", ".csv", ".log", ".yaml", ".yml"))
        ):
            return self.text_extractor

        return None

extractor_resolver = ExtractorResolver()
