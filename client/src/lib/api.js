const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:10000" : "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export const api = {
  createProfile: (body) => request("/api/users", { method: "POST", body: JSON.stringify(body) }),
  chat: (body) => request("/api/chat", { method: "POST", body: JSON.stringify(body) }),
  resume: (body) => request("/api/resume", { method: "POST", body: JSON.stringify(body) }),
  interview: (body) => request("/api/interview", { method: "POST", body: JSON.stringify(body) }),
  admin: () => request("/api/admin")
};
