export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getActiveDevPersonaId(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("skillsetu_dev_persona_id") || "stu-aarav-sharma";
  }
  return "stu-aarav-sharma";
}

export function setActiveDevPersonaId(personaId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("skillsetu_dev_persona_id", personaId);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  // Inject deterministic development persona context header
  const personaId = getActiveDevPersonaId();
  if (personaId) {
    headers.set("X-Dev-Persona-Id", personaId);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    const message = (errorData && (errorData.detail || errorData.message)) || `API Error: ${response.status} ${response.statusText}`;
    throw new ApiError(message, response.status, errorData);
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { method: "GET", ...options }),
  post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: "POST", body: data ? JSON.stringify(data) : undefined, ...options }),
  put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: "PUT", body: data ? JSON.stringify(data) : undefined, ...options }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { method: "DELETE", ...options }),
  upload: async <T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(options?.headers || {});
    headers.set("Accept", "application/json");
    const personaId = getActiveDevPersonaId();
    if (personaId) {
      headers.set("X-Dev-Persona-Id", personaId);
    }
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers,
      ...options,
    });
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      const message = (errorData && (errorData.detail || errorData.message)) || `Upload failed with status ${response.status}`;
      throw new ApiError(message, response.status, errorData);
    }
    return response.json();
  },
};

