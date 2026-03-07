import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    CurrentUserResponse,
    Role
} from '../types';
import { userService } from '../services/userService';
import { useAuth } from './AuthContext';

interface UserContextType {
  currentUser: CurrentUserResponse | null;
  loading: boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  isAdmin: boolean;
  isGerente: boolean;
  isFuncionario: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const refreshUser = async () => {
    try {
      setLoading(true);
      const response = await userService.getCurrentUser();
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Re-busca o usuário sempre que o token mudar (login/logout)
  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  }, [token]);

  const hasRole = (role: Role): boolean => {
    return currentUser?.role === role;
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    return currentUser ? roles.includes(currentUser.role) : false;
  };

  const value: UserContextType = {
    currentUser,
    loading,
    hasRole,
    hasAnyRole,
    isAdmin: hasRole(Role.ADMIN),
    isGerente: hasRole(Role.GERENTE),
    isFuncionario: hasRole(Role.FUNCIONARIO),
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};
