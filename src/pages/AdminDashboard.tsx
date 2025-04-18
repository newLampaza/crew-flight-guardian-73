
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Calendar, 
  FileBarChart, 
  PlaneLanding, 
  Server, 
  Database,
  RefreshCcw,
  Users
} from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Панель администратора</h1>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Система</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Расписание</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            <span>Отчеты</span>
          </TabsTrigger>
          <TabsTrigger value="server" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span>Сервер</span>
          </TabsTrigger>
        </TabsList>

        {/* Система - настройка ИИ */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки нейронной сети</CardTitle>
              <CardDescription>
                Управление параметрами анализа усталости
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Порог определения усталости</label>
                  <input type="range" min="0" max="100" defaultValue="70" className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>70%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Чувствительность модели</label>
                  <input type="range" min="0" max="100" defaultValue="85" className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Низкая</span>
                    <span>Средняя</span>
                    <span>Высокая</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Текущая версия модели</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-muted px-2 py-1 rounded">fatigue_model_v1.2.keras</span>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Обновить
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Сохранить настройки</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>База тренировочных данных</CardTitle>
              <CardDescription>
                Управление данными для обучения нейронной сети
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center border rounded-lg p-4">
                  <Database className="h-8 w-8 text-primary mb-2" />
                  <p className="font-medium">24,560</p>
                  <p className="text-xs text-muted-foreground">Образцов</p>
                </div>
                
                <div className="flex flex-col items-center border rounded-lg p-4">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <p className="font-medium">134</p>
                  <p className="text-xs text-muted-foreground">Пилотов</p>
                </div>

                <div className="flex flex-col items-center border rounded-lg p-4">
                  <PlaneLanding className="h-8 w-8 text-primary mb-2" />
                  <p className="font-medium">1,245</p>
                  <p className="text-xs text-muted-foreground">Рейсов</p>
                </div>

                <div className="flex flex-col items-center border rounded-lg p-4 bg-primary/5">
                  <Button size="sm" variant="outline" className="h-8 w-8 rounded-full mb-2">+</Button>
                  <p className="font-medium">Добавить</p>
                  <p className="text-xs text-muted-foreground">новые данные</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">Экспорт данных</Button>
                <Button>Обучить модель</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладки для других функций */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Управление расписанием и экипажами</CardTitle>
              <CardDescription>
                Настройка рейсов и состав экипажей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Здесь будет интерфейс для управления расписанием полетов и назначения экипажей
              </p>
              <div className="h-[400px] flex justify-center items-center border rounded-md mt-4 bg-muted/20">
                {/* Заглушка для будущего контента */}
                <span className="text-muted-foreground">Интерфейс управления расписанием</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Отчеты и аналитика</CardTitle>
              <CardDescription>
                Генерация отчетов по подразделениям и рейсам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Здесь будут отображаться инструменты для создания и просмотра отчетов
              </p>
              <div className="h-[400px] flex justify-center items-center border rounded-md mt-4 bg-muted/20">
                {/* Заглушка для будущего контента */}
                <span className="text-muted-foreground">Инструменты отчетности</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="server">
          <Card>
            <CardHeader>
              <CardTitle>Мониторинг сервера</CardTitle>
              <CardDescription>
                Контроль состояния системы и аппаратных ресурсов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Здесь будут отображаться показатели работы сервера и системы
              </p>
              <div className="h-[400px] flex justify-center items-center border rounded-md mt-4 bg-muted/20">
                {/* Заглушка для будущего контента */}
                <span className="text-muted-foreground">Панель мониторинга</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
