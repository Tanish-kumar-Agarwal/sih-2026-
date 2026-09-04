import fitz  # PyMuPDF
from typing import List, Dict, Any
from app.domains.evidence.extraction.base import BaseExtractor, ExtractionResult

class PyMuPDFExtractor(BaseExtractor):
    name: str = "PyMuPDFExtractor"
    version: str = "v1.0.0"

    def extract(self, content: bytes, filename: str) -> ExtractionResult:
        try:
            doc = fitz.open(stream=content, filetype="pdf")
        except Exception as e:
            return ExtractionResult(
                raw_text="",
                page_count=0,
                status="FAILED",
                error_message=f"Corrupt or unreadable PDF document: {str(e)}",
                extractor_name=self.name,
                extractor_version=self.version
            )

        try:
            page_count = len(doc)
            if page_count == 0:
                return ExtractionResult(
                    raw_text="",
                    page_count=0,
                    status="EMPTY",
                    error_message="PDF contains 0 pages",
                    extractor_name=self.name,
                    extractor_version=self.version
                )

            extracted_pages: List[str] = []
            for i in range(page_count):
                page = doc.load_page(i)
                text = page.get_text("text").strip()
                extracted_pages.append(text)

            full_text = "\n\n--- Page Break ---\n\n".join(filter(None, extracted_pages)).strip()

            meta = doc.metadata or {}
            metadata: Dict[str, Any] = {
                "title": meta.get("title") or filename,
                "author": meta.get("author"),
                "subject": meta.get("subject"),
                "creator": meta.get("creator"),
                "producer": meta.get("producer"),
                "creation_date": meta.get("creationDate"),
                "mod_date": meta.get("modDate"),
                "page_count": page_count,
            }

            # Technical Observations
            observations: List[str] = [
                f"PDF document contains {page_count} page(s).",
                f"Original document filename: '{filename}'."
            ]

            if metadata.get("author"):
                observations.append(f"Document author metadata: '{metadata['author']}'.")

            if not full_text:
                observations.append("Document contains no extractable text layer (possible image-only or scanned document).")
                return ExtractionResult(
                    raw_text="",
                    page_count=page_count,
                    extracted_metadata=metadata,
                    observed_facts=observations,
                    status="EMPTY",
                    error_message="No extractable text layer found in document",
                    extractor_name=self.name,
                    extractor_version=self.version
                )

            # Character count observation
            observations.append(f"Extracted {len(full_text)} characters of text content across {page_count} page(s).")

            return ExtractionResult(
                raw_text=full_text,
                page_count=page_count,
                extracted_metadata=metadata,
                observed_facts=observations,
                status="COMPLETED",
                extractor_name=self.name,
                extractor_version=self.version
            )
        finally:
            doc.close()
