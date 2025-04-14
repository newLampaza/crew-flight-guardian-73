
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  name: string;
  role: string;
  position: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

// Sample user data - in a real application, this would come from a backend
const SAMPLE_USER: User = {
  id: "1",
  name: "Иван Петров",
  role: "Пилот",
  position: "Капитан",
  avatarUrl: "/pilot-avatar.jpg"
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
        // In a real app, validate credentials against a backend
        if (username === "pilot" && password === "password") {
          setUser(SAMPLE_USER);
          localStorage.setItem("fatigue-guard-user", JSON.stringify(SAMPLE_USER));
          toast({
            title: "Вход выполнен успешно",
            description: `Добро пожаловать, ${SAMPLE_USER.name}`,
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
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
