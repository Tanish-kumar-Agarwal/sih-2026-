import re
import unicodedata
from typing import Optional

def normalize_skill_text(raw_text: Optional[str]) -> str:
    """
    Authoritative deterministic text normalization pipeline for skill inputs.
    
    Transforms arbitrary representations into a canonical normalized lookup key:
    1. Rejects None and empty values safely
    2. Applies Unicode NFKC normalization (reconciling decomposed accents/symbols)
    3. Trims peripheral whitespace
    4. Folds case to lower
    5. Strips noise punctuation (quotes, brackets, parenthesis, colons, semicolons, exclamation marks)
    6. Strictly preserves semantic programming language tokens (+ for C++, # for C#, . for .NET/Node.js, / for C/C++)
    7. Collapses redundant internal whitespace to a single space
    
    Idempotent invariant:
        normalize_skill_text(normalize_skill_text(x)) == normalize_skill_text(x)
    """
    if raw_text is None or not isinstance(raw_text, str):
        return ""

    # 1. Unicode NFKC normalization
    text = unicodedata.normalize("NFKC", raw_text)

    # 2. Trim whitespace
    text = text.strip()
    if not text:
        return ""

    # 3. Case folding
    text = text.lower()

    # 4. Remove peripheral quotes, brackets, parens, and noise punctuation
    #    Keep alphanumeric, spaces, and safe semantic tokens: +, #, ., -, _, /
    text = re.sub(r'[\'"`\(\)\[\]\{\}\<\>\!\?\,\;\:\*\~\^\@\$\%\&]', ' ', text)

    # 5. Convert underscores and hyphens to spaces (e.g. React-JS -> react js)
    text = text.replace('_', ' ').replace('-', ' ')

    # 6. Collapse redundant whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    # 8. Clean trailing dots/dashes while preserving leading dot for .net
    # e.g., "react.js." -> "react.js", but keep ".net"
    if len(text) > 1 and text.endswith(('.', '-')):
        text = text[:-1].rstrip()

    return text

def generate_skill_slug(name: str) -> str:
    """
    Generate an immutable URL-safe slug for canonical skills,
    preserving semantic identifiers like C++ -> cpp, C# -> csharp.
    """
    if not name:
        return ""
    slug = name.strip().lower()
    # Semantic token substitutions
    slug = slug.replace("c++", "cpp")
    slug = slug.replace("c#", "csharp")
    slug = slug.replace(".net", "dotnet")
    # Replace non-alphanumeric characters with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug
