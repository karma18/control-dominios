import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiClient, setAuthTokenProvider } from '../../services/apiClient';

const AuthContext = createContext(null);
const tokenStorageKey = 'control-dominios-token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(tokenStorageKey));
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(token));

  useEffect(() => {
    setAuthTokenProvider(() => token);
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const profile = await apiClient.me();

        if (isMounted) {
          setUser(profile);
        }
      } catch (error) {
        localStorage.removeItem(tokenStorageKey);

        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const result = await apiClient.login(email, password);
    localStorage.setItem(tokenStorageKey, result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(tokenStorageKey);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    isBootstrapping,
    login,
    logout,
  }), [isBootstrapping, login, logout, token, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
