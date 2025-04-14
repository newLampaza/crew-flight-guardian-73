
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Bell, Eye, Shield, HelpCircle } from "lucide-react";

const SettingsPage = () => {
  const { logout } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Категории настроек</CardTitle>
              <CardDescription>
                Управление настройками приложения
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" disabled>
                  <User className="mr-2 h-4 w-4" />
                  Профиль
                </Button>
                <Button variant="ghost" className="w-full justify-start" disabled>
                  <Bell className="mr-2 h-4 w-4" />
                  Уведомления
                </Button>
                <Button variant="ghost" className="w-full justify-start" disabled>
                  <Eye className="mr-2 h-4 w-4" />
                  Внешний вид
                </Button>
                <Button variant="ghost" className="w-full justify-start" disabled>
                  <Shield className="mr-2 h-4 w-4" />
                  Безопасность
                </Button>
                <Button variant="ghost" className="w-full justify-start" disabled>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Помощь
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Управление аккаунтом</CardTitle>
              <CardDescription>
                Настройки доступа и безопасности
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Выход из системы</h3>
                  <p className="text-sm text-muted-foreground">
                    Завершите сеанс работы с системой
                  </p>
                </div>
                <Button variant="destructive" onClick={logout} className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти из аккаунта
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Информация о системе</h3>
                  <p className="text-sm text-muted-foreground">
                    Версия и информация о приложении
                  </p>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Версия приложения</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Последнее обновление</span>
                    <span>14 апреля 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Тип лицензии</span>
                    <span>Корпоративная</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
