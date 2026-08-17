import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext(null);

// ======================================================
// AUTH PROVIDER
// ======================================================

export const AuthProvider = ({ children }) => {
  // ======================================================
  // USER
  // ======================================================

  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error(
        "Failed to load saved user:",
        error
      );

      localStorage.removeItem("user");

      return null;
    }
  });

  // ======================================================
  // TOKEN
  // ======================================================

  const [token, setToken] = useState(() => {
    return (
      localStorage.getItem("token") || null
    );
  });

  // ======================================================
  // LOGIN
  // ======================================================

  const login = (userData, jwtToken) => {
    if (!jwtToken) {
      console.error(
        "Login failed: JWT token was not provided."
      );

      return false;
    }

    try {
      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      localStorage.setItem(
        "token",
        jwtToken
      );

      setUser(userData);
      setToken(jwtToken);

      return true;
    } catch (error) {
      console.error(
        "Failed to save login information:",
        error
      );

      return false;
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setToken(null);
  };

  // ======================================================
  // CONTEXT
  // ======================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ======================================================
// USE AUTH
// ======================================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
};