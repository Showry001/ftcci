// Calls the admin API (/api/admin). Errors carry a plain message staff can act on.
const OFFLINE = "Can't reach the FTCCI server. Check that it is running, then try again.";

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`/api/admin${path}`, {
      method,
      headers: { accept: "application/json", ...(body ? { "content-type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(OFFLINE);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    // Content errors also name the fields to fix, keyed by path ("timeline.3.title").
    const err = new Error(json?.message ?? OFFLINE);
    err.fields = json?.fields ?? {};
    throw err;
  }
  return json;
}

export const api = {
  get: (path) => request("GET", path),
  patch: (path, body) => request("PATCH", path, body),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  delete: (path) => request("DELETE", path),
};

export const query = (params) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null));
  return q.size ? `?${q}` : "";
};

const ist = { timeZone: "Asia/Kolkata" };
export const formatDate = (iso) => new Intl.DateTimeFormat("en-IN", { ...ist, day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
export const formatTime = (iso) => new Intl.DateTimeFormat("en-IN", { ...ist, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
export const formatDateTime = (iso) => `${formatDate(iso)}, ${formatTime(iso)} IST`;
