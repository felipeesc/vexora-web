import { createContext, useContext, useState } from "react";
import { authService } from "../services/authService";

type AuthContextType = {
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );

    async function login(username: string, password: string) {
        const { data } = await authService.login({ username, password });
        localStorage.setItem("token", data.token);
        setToken(data.token);
    }

    function logout() {
        localStorage.removeItem("token");
        setToken(null);
    }

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
