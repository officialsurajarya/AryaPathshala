import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("arya_user_info");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem("arya_auth_token"));
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const currentToken = localStorage.getItem("arya_auth_token");
    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/profile");
      if (response && response.success && response.data) {
        setUser(response.data);
      } else {
        localStorage.removeItem("arya_auth_token");
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn("Session check fallback:", err.message);
      // If server unreachable, check if we had cached user
      const cached = localStorage.getItem("arya_user_info");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch (e) {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    if (response && response.success && response.data) {
      const { token: receivedToken, user: receivedUser } = response.data;
      localStorage.setItem("arya_auth_token", receivedToken);
      localStorage.setItem("arya_user_info", JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return response;
    }
    throw new Error(response.message || "लॉगिन विफल रहा");
  };

  const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response && response.success && response.data) {
      const { token: receivedToken, user: receivedUser } = response.data;
      if (receivedToken) {
        localStorage.setItem("arya_auth_token", receivedToken);
        localStorage.setItem("arya_user_info", JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
      }
      return response;
    }
    throw new Error(response.message || "पंजीकरण विफल रहा");
  };

  const forgotPassword = async (email) => {
    return await api.post("/auth/forgot-password", { email });
  };

  const resetPassword = async (resetToken, password, confirmPassword) => {
    return await api.post("/auth/reset-password", {
      token: resetToken,
      password,
      confirmPassword,
    });
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem("arya_auth_token");
      localStorage.removeItem("arya_user_info");
      localStorage.removeItem("arya_active_dashboard");
      localStorage.removeItem("arya_admin_tab");
      if (typeof window !== "undefined" && (window.location.hash.startsWith("#admin") || window.location.hash.startsWith("#dashboard"))) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (updates) => {
    const response = await api.put("/auth/profile", updates);
    if (response && response.success && response.data) {
      setUser((prev) => ({ ...prev, ...response.data }));
      localStorage.setItem(
        "arya_user_info",
        JSON.stringify({ ...user, ...response.data })
      );
      return response;
    }
    throw new Error(response.message || "अपडेट विफल रहा");
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    isTeacher: user?.role === "TEACHER",
    isStudent: user?.role === "STUDENT",
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
    refreshUser: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
