// Calls the API. Admin calls (`api`) go to /api/admin; sign-in calls (`auth`) to /api/auth. Changes carry
// the session's CSRF token. Errors carry a plain message staff can act on.
const OFFLINE = "Can't reach the FTCCI server. Check that it is running, then try again.";

let csrfToken = "";
let onSignedOut = () => {};
/** Set after sign-in: the token every change must carry. */
export const setCsrfToken = (token) => {
  csrfToken = token ?? "";
};
/** Called when the server says the session has ended (signed out after 8 idle hours, or disabled). */
export const whenSignedOut = (fn) => {
  onSignedOut = fn;
};
export const csrfHeader = () => (csrfToken ? { "x-csrf-token": csrfToken } : {});

async function request(base, method, path, body) {
  let res;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers: { accept: "application/json", ...(body ? { "content-type": "application/json" } : {}), ...(method === "GET" ? {} : csrfHeader()) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(OFFLINE);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && base === "/api/admin") onSignedOut(json?.message);
    // Content errors also name the fields to fix, keyed by path ("timeline.3.title").
    const err = new Error(json?.message ?? OFFLINE);
    err.fields = json?.fields ?? {};
    err.status = res.status;
    err.code = json?.error;
    throw err;
  }
  return json;
}

const client = (base) => ({
  get: (path) => request(base, "GET", path),
  patch: (path, body) => request(base, "PATCH", path, body),
  post: (path, body) => request(base, "POST", path, body),
  put: (path, body) => request(base, "PUT", path, body),
  delete: (path) => request(base, "DELETE", path),
});
export const api = client("/api/admin");
export const auth = client("/api/auth");

export const query = (params) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null));
  return q.size ? `?${q}` : "";
};

const ist = { timeZone: "Asia/Kolkata" };
export const formatDate = (iso) => new Intl.DateTimeFormat("en-IN", { ...ist, day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
export const formatTime = (iso) => new Intl.DateTimeFormat("en-IN", { ...ist, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
export const formatDateTime = (iso) => `${formatDate(iso)}, ${formatTime(iso)} IST`;
