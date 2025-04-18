
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Users, Brain, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const MedicalHome = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Медицинская панель</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ожидают проверки</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Результатов анализа
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пилотов на контроле</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">
              +5 за неделю
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средний уровень усталости</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <p className="text-xs text-muted-foreground">
              -3% к прошлой неделе
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Проверок сегодня</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              По расписанию
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Требуют внимания</CardTitle>
            <CardDescription>Пилоты с повышенным уровнем усталости</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium">Иванов А.П.</p>
                    <p className="text-xs text-muted-foreground">Усталость: 78%</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Проверить</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium">Петров С.И.</p>
                    <p className="text-xs text-muted-foreground">Усталость: 65%</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Проверить</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ближайшие проверки</CardTitle>
            <CardDescription>Запланированные медицинские осмотры</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium">Сидоров М.В.</p>
                    <p className="text-xs text-muted-foreground">Сегодня, 14:30</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Детали</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium">Кузнецова А.И.</p>
                    <p className="text-xs text-muted-foreground">Завтра, 10:00</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Детали</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicalHome;
