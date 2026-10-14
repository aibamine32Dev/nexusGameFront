import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchCurrentClient,
  loginClient,
  logoutClientOnServer,
  registerClient,
} from "../services/authApi";

const TOKEN_KEY = "nexusClientToken";
const USER_KEY = "nexusClientUser";

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState(readStoredUser);
  const [checking, setChecking] = useState(
    () => Boolean(localStorage.getItem(TOKEN_KEY))
  );

  const saveSession = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (savedToken) logoutClientOnServer(savedToken);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Check the saved session once when the site opens
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (!savedToken) return;

    fetchCurrentClient(savedToken)
      .then((freshUser) => {
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        setUser(freshUser);
      })
      .catch((error) => {
        // Only log out when the server says the session is
        // invalid. If the server is just unreachable (offline,
        // sleeping), keep the client logged in.
        if (error.status === 401 || error.status === 403) {
          logout();
        }
      })
      .finally(() => setChecking(false));
  }, [logout]);

  const login = useCallback(
    async (credentials) => {
      const data = await loginClient(credentials);
      saveSession(data.token, data.user);
      return data.user;
    },
    [saveSession]
  );

  const register = useCallback(
    async (details) => {
      const data = await registerClient(details);
      saveSession(data.token, data.user);
      return data.user;
    },
    [saveSession]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      checking,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token, checking, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return context;
}
