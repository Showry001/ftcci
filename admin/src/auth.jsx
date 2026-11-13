import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { auth, setCsrfToken, whenSignedOut } from "./api.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Finds out who is signed in, then shows the sign-in pages or the admin. When the server ends the
// session (8 hours without activity, or the account was disabled), every screen returns to sign-in.
export default function Auth() {
  const [state, setState] = useState({ checked: false, user: null, notice: "" });

  const signedIn = useCallback(({ user, csrfToken }) => {
    setCsrfToken(csrfToken);
    setState({ checked: true, user, notice: "" });
  }, []);
  const signedOut = useCallback((notice = "") => {
    setCsrfToken("");
    setState({ checked: true, user: null, notice });
  }, []);

  useEffect(() => {
    whenSignedOut((message) => signedOut(message ?? "Please sign in again."));
    auth.get("/me").then(signedIn, (e) => signedOut(e.code === "signed_out" ? e.message : ""));
  }, [signedIn, signedOut]);

  const value = useMemo(
    () => ({
      ...state,
      signedIn,
      signedOut,
      update: (user) => setState((s) => ({ ...s, user })),
      signOut: async () => {
        await auth.post("/sign-out").catch(() => {});
        signedOut("You have signed out.");
      },
    }),
    [state, signedIn, signedOut],
  );

  return <AuthContext.Provider value={value}>{state.checked ? <Outlet /> : null}</AuthContext.Provider>;
}

/** Sends people who aren't signed in to the sign-in page, then back to where they were going. */
export function RequireStaff({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/sign-in" replace state={{ from: `${location.pathname}${location.search}` }} />;
  return children;
}

/** Shows its children to Super Admins only. */
export function SuperAdminOnly({ children }) {
  const { user } = useAuth();
  return user?.role === "super_admin" ? children : <Navigate to="/" replace />;
}

export const roleLabel = { super_admin: "Super Admin", admin: "Admin" };
