
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Server, Users, PlaneLanding } from "lucide-react";

const AdminHome = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Панель администратора</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных пользователей</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">134</div>
            <p className="text-xs text-muted-foreground">
              +6 за последний месяц
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Загрузка сервера</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <p className="text-xs text-muted-foreground">
              Нормальная нагрузка
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">База данных</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,560</div>
            <p className="text-xs text-muted-foreground">
              Записей в системе
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Рейсов сегодня</CardTitle>
            <PlaneLanding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              +2 к среднему
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Системные уведомления</CardTitle>
            <CardDescription>Последние события системы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Обновление базы данных завершено</p>
                  <p className="text-xs text-muted-foreground">2 часа назад</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Плановое обслуживание сервера</p>
                  <p className="text-xs text-muted-foreground">Запланировано на завтра</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Активность системы</CardTitle>
            <CardDescription>За последние 24 часа</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Анализов усталости проведено</p>
                  <p className="text-xs text-muted-foreground">142 анализа</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Новых пользователей</p>
                  <p className="text-xs text-muted-foreground">3 пользователя</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
