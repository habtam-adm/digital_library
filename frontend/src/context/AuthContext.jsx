import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { TOKEN_KEY } from "../api/client";
import { fetchMe, login as loginRequest } from "../api/library";

const AuthContext = createContext(null);
const USER_KEY = "wku_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    // Refresh the cached profile and drop the session if the token expired.
    fetchMe()
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isStaff: ["librarian", "admin"].includes(user?.role),
      isAdmin: user?.role === "admin",
      login: async (email, password) => {
        const { data } = await loginRequest({ email, password });
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
