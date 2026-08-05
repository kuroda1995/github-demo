const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${message || res.statusText}`);
  }

  if (res.status === 204) return null;
  return res.json();
}
