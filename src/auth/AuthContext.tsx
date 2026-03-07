import { createContext, useContext, useState, useMemo } from "react";
import { authService } from "../services/authService";

function parseJwtPayload(token: string): Record<string, any> | null {
    try {
        const base64 = token.split(".")[1];
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

type AuthContextType = {
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    role: string | null;
    isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );
    const [storedRole, setStoredRole] = useState<string | null>(
        localStorage.getItem("role")
    );

    const role = useMemo(() => {
        if (storedRole) return storedRole;
        if (!token) return null;
        const payload = parseJwtPayload(token);
        return payload?.role || null;
    }, [token, storedRole]);

    const isAdmin = role === "ADMIN" || role === "ROLE_ADMIN";

    async function login(username: string, password: string) {
        const { data } = await authService.login({ username, password });
        localStorage.setItem("token", data.token);
        if (data.role) {
            localStorage.setItem("role", data.role);
            setStoredRole(data.role);
        }
        setToken(data.token);
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setToken(null);
        setStoredRole(null);
    }

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token, role, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
