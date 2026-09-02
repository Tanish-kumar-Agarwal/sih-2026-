const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchWithFallback<T>(endpoint: string, fallbackData: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 10 }
    });
    if (!res.ok) {
      return fallbackData;
    }
    return await res.json();
  } catch (err) {
    // Graceful fallback to client-side data
    return fallbackData;
  }
}
