import re
import ipaddress
import urllib.parse
from typing import Dict, Any, List, Optional, Tuple
import httpx

from app.config.settings import settings

class GitHubError(Exception):
    """Base exception for GitHub API interactions."""
    pass

class InvalidRepositoryUrlError(GitHubError):
    """Raised when repository URL is invalid, unsafe, or non-GitHub."""
    pass

class GitHubNotFoundError(GitHubError):
    """Raised when repository is not found (404) or deleted."""
    pass

class GitHubRateLimitError(GitHubError):
    """Raised when GitHub API rate limit is exceeded (403/429)."""
    def __init__(self, message: str, reset_timestamp: Optional[int] = None):
        super().__init__(message)
        self.reset_timestamp = reset_timestamp

class GitHubForbiddenError(GitHubError):
    """Raised when repository is private or access is restricted."""
    pass

class GitHubNetworkError(GitHubError):
    """Raised on network timeout, connection reset, or DNS failure."""
    pass


GITHUB_URL_PATTERN = re.compile(
    r"^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git|\/)?$"
)

def parse_and_validate_github_url(raw_url: str) -> Tuple[str, str, str]:
    """
    Strictly validates, normalizes, and sanitizes a GitHub repository URL against SSRF attacks.
    Returns (owner, repo, canonical_url).
    """
    if not raw_url or not isinstance(raw_url, str):
        raise InvalidRepositoryUrlError("Repository URL cannot be empty.")

    clean_url = raw_url.strip()
    parsed = urllib.parse.urlparse(clean_url)

    # Scheme validation: Only HTTPS allowed
    if parsed.scheme.lower() != "https":
        raise InvalidRepositoryUrlError("Only https:// URLs are allowed for security.")

    # Host validation: Only github.com allowed (Strict hostname match, rejects localhost/IPs)
    hostname = (parsed.hostname or "").lower()
    if hostname != "github.com":
        raise InvalidRepositoryUrlError(f"Unsupported host '{hostname}'. Only public 'github.com' repositories are supported.")

    # Check for IP literal in hostname to prevent SSRF bypass
    try:
        ip = ipaddress.ip_address(hostname)
        raise InvalidRepositoryUrlError("IP addresses are strictly prohibited in repository URLs.")
    except ValueError:
        pass  # Expected: hostname is not an IP literal

    # Match owner and repository name
    match = GITHUB_URL_PATTERN.match(clean_url)
    if not match:
        raise InvalidRepositoryUrlError(
            f"Invalid GitHub repository URL format: '{clean_url}'. Expected 'https://github.com/owner/repo'."
        )

    owner, repo = match.groups()

    # Reject path traversal tokens or dangerous symbols
    if ".." in owner or ".." in repo or "/" in owner or "/" in repo:
        raise InvalidRepositoryUrlError("Path traversal sequences are strictly prohibited.")

    canonical_url = f"https://github.com/{owner}/{repo}"
    return owner, repo, canonical_url


class GitHubApiClient:
    """Provider-agnostic HTTP client for querying GitHub REST API v3 with rate-limiting and security guards."""

    def __init__(self, base_url: Optional[str] = None, token: Optional[str] = None, timeout: Optional[float] = None):
        self.base_url = (base_url or settings.GITHUB_API_BASE_URL).rstrip("/")
        self.token = token or settings.GITHUB_TOKEN
        self.timeout = timeout or settings.GITHUB_REQUEST_TIMEOUT_SECONDS

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": f"SkillSetu-Platform/1.0 ({settings.ENVIRONMENT})",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    async def _request(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        url = f"{self.base_url}{endpoint if endpoint.startswith('/') else '/' + endpoint}"
        headers = self._get_headers()

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=headers, params=params)

                # Check rate limit headers
                rate_limit_remaining = response.headers.get("x-ratelimit-remaining")
                rate_limit_reset = response.headers.get("x-ratelimit-reset")
                reset_ts = int(rate_limit_reset) if rate_limit_reset and rate_limit_reset.isdigit() else None

                if response.status_code == 200:
                    return response.json()

                if response.status_code == 404:
                    raise GitHubNotFoundError(f"GitHub repository or resource not found: '{endpoint}'")

                if response.status_code in (403, 429):
                    msg = response.json().get("message", "API rate limit exceeded or access forbidden.") if response.content else "Rate limit"
                    if "rate limit" in msg.lower():
                        raise GitHubRateLimitError(
                            f"GitHub API rate limit exceeded. Resets at {reset_ts}.",
                            reset_timestamp=reset_ts
                        )
                    raise GitHubForbiddenError(f"GitHub repository access restricted: {msg}")

                if response.status_code >= 500:
                    raise GitHubNetworkError(f"GitHub upstream server error: HTTP {response.status_code}")

                response.raise_for_status()
                return response.json()

        except httpx.TimeoutException:
            raise GitHubNetworkError(f"Connection timed out while querying GitHub API: {endpoint}")
        except httpx.RequestError as ex:
            raise GitHubNetworkError(f"Network error querying GitHub API: {str(ex)}")

    async def get_repository_metadata(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetches core repository metadata (stars, forks, parent repo, default branch)."""
        return await self._request(f"/repos/{owner}/{repo}")

    async def get_languages(self, owner: str, repo: str) -> Dict[str, int]:
        """Fetches repository language byte counts."""
        return await self._request(f"/repos/{owner}/{repo}/languages")

    async def get_contributors(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        """Fetches top contributors list with commit counts."""
        res = await self._request(f"/repos/{owner}/{repo}/contributors", params={"per_page": 30})
        return res if isinstance(res, list) else []

    async def get_commits(self, owner: str, repo: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Fetches bounded commit history on default branch."""
        per_page = min(limit, 100)
        res = await self._request(f"/repos/{owner}/{repo}/commits", params={"per_page": per_page})
        return res if isinstance(res, list) else []

    async def get_pull_requests(self, owner: str, repo: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetches pull requests (open, closed, merged)."""
        per_page = min(limit, 50)
        res = await self._request(f"/repos/{owner}/{repo}/pulls", params={"state": "all", "per_page": per_page})
        return res if isinstance(res, list) else []

    async def get_raw_manifest(self, owner: str, repo: str, path: str) -> Optional[str]:
        """Fetches raw manifest file content (e.g. package.json, requirements.txt) without executing code."""
        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{path}"
        headers = self._get_headers()
        headers["Accept"] = "application/vnd.github.v3.raw"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    return res.text
                return None
        except Exception:
            return None

github_client = GitHubApiClient()
