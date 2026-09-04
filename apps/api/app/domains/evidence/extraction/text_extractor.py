from typing import List, Dict, Any
from app.domains.evidence.extraction.base import BaseExtractor, ExtractionResult

class PlainTextExtractor(BaseExtractor):
    name: str = "PlainTextExtractor"
    version: str = "v1.0.0"

    def extract(self, content: bytes, filename: str) -> ExtractionResult:
        try:
            text = content.decode("utf-8").strip()
        except UnicodeDecodeError:
            try:
                text = content.decode("latin-1").strip()
            except Exception as e:
                return ExtractionResult(
                    raw_text="",
                    page_count=1,
                    status="FAILED",
                    error_message=f"Unable to decode text document: {str(e)}",
                    extractor_name=self.name,
                    extractor_version=self.version
                )

        if not text:
            return ExtractionResult(
                raw_text="",
                page_count=1,
                status="EMPTY",
                error_message="Document is empty",
                extractor_name=self.name,
                extractor_version=self.version
            )

        line_count = len(text.splitlines())
        metadata: Dict[str, Any] = {
            "filename": filename,
            "char_count": len(text),
            "line_count": line_count,
            "encoding": "utf-8"
        }

        observations: List[str] = [
            f"Plain text document contains {line_count} line(s) and {len(text)} character(s).",
            f"Original filename: '{filename}'."
        ]

        return ExtractionResult(
            raw_text=text,
            page_count=1,
            extracted_metadata=metadata,
            observed_facts=observations,
            status="COMPLETED",
            extractor_name=self.name,
            extractor_version=self.version
        )
