
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaneTakeoff } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("pilot");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Для обнаружения текущей темы при загрузке страницы
  useEffect(() => {
    // Проверяем текущую тему при монтировании компонента
    const isDarkMode = document.documentElement.classList.contains('dark');
    document.body.classList.toggle('dark-login', isDarkMode);
    
    // Очистка при размонтировании
    return () => {
      document.body.classList.remove('dark-login');
    };
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!username || !password) {
      alert("Пожалуйста, заполните все поля");
      setLoading(false);
      return;
    }
    
    const success = await login(selectedRole, password);
    if (success) {
      // Направляем на соответствующую страницу в зависимости от роли
      if (selectedRole === "admin") {
        navigate("/admin");
      } else if (selectedRole === "medical") {
        navigate("/medical");
      } else {
        navigate("/");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <Card className="w-full shadow-lg border-border">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary p-3 rounded-full">
                <PlaneTakeoff className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Система контроля усталости экипажа</CardTitle>
            <CardDescription>Введите данные для входа в систему</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <Tabs defaultValue="pilot" value={selectedRole} onValueChange={setSelectedRole} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="pilot">Пилот</TabsTrigger>
                  <TabsTrigger value="admin">Администратор</TabsTrigger>
                  <TabsTrigger value="medical">Медработник</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pilot">
                  <p className="text-sm text-muted-foreground mb-4">
                    Интерфейс пилота для анализа усталости и когнитивных тестов
                  </p>
                </TabsContent>
                <TabsContent value="admin">
                  <p className="text-sm text-muted-foreground mb-4">
                    Панель управления системой и настройки нейросети
                  </p>
                </TabsContent>
                <TabsContent value="medical">
                  <p className="text-sm text-muted-foreground mb-4">
                    Доступ к верификации анализа и медицинским данным
                  </p>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Логин
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите логин"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Пароль
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Выполняется вход
                  </span>
                ) : (
                  "Войти"
                )}
              </Button>
            </CardFooter>
          </form>
          
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>Тестовые данные: пользователь "{selectedRole}", пароль "password"</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
