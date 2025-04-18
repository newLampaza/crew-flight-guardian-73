
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export type UserRole = "pilot" | "admin" | "medical";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  position: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAdmin: () => boolean;
  isMedical: () => boolean;
  isPilot: () => boolean;
}

// Добавляем тестовых пользователей для разных ролей
const SAMPLE_USERS: Record<string, User> = {
  pilot: {
    id: "1",
    name: "Иван Петров",
    role: "pilot",
    position: "Капитан",
    avatarUrl: "/pilot-avatar.jpg"
  },
  admin: {
    id: "2",
    name: "Алексей Сидоров",
    role: "admin",
    position: "Системный администратор",
    avatarUrl: "/admin-avatar.jpg"
  },
  medical: {
    id: "3",
    name: "Елена Иванова",
    role: "medical",
    position: "Медицинский специалист",
    avatarUrl: "/medical-avatar.jpg"
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("fatigue-guard-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Проверяем, есть ли пользователь с таким именем
        const validUsernames = Object.keys(SAMPLE_USERS);
        if (validUsernames.includes(username) && password === "password") {
          const user = SAMPLE_USERS[username];
          setUser(user);
          localStorage.setItem("fatigue-guard-user", JSON.stringify(user));
          toast({
            title: "Вход выполнен успешно",
            description: `Добро пожаловать, ${user.name}`,
          });
          setLoading(false);
          resolve(true);
        } else {
          toast({
            title: "Ошибка входа",
            description: "Неверное имя пользователя или пароль",
            variant: "destructive",
          });
          setLoading(false);
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fatigue-guard-user");
    navigate("/login");
    toast({
      title: "Выход из системы",
      description: "Вы успешно вышли из системы",
    });
  };

  // Вспомогательные функции для проверки роли
  const isAdmin = () => user?.role === "admin";
  const isMedical = () => user?.role === "medical";
  const isPilot = () => user?.role === "pilot";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        isAdmin,
        isMedical,
        isPilot
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
