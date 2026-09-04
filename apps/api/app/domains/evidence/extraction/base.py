from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List

@dataclass
class ExtractionResult:
    raw_text: str
    page_count: int
    extracted_metadata: Dict[str, Any] = field(default_factory=dict)
    observed_facts: List[str] = field(default_factory=list)
    status: str = "COMPLETED"  # 'COMPLETED', 'EMPTY', 'FAILED'
    error_message: Optional[str] = None
    extractor_name: str = "BaseExtractor"
    extractor_version: str = "v1.0.0"

class BaseExtractor(ABC):
    name: str = "BaseExtractor"
    version: str = "v1.0.0"

    @abstractmethod
    def extract(self, content: bytes, filename: str) -> ExtractionResult:
        """Extracts structured text, technical metadata, and observed facts from document bytes."""
        pass
