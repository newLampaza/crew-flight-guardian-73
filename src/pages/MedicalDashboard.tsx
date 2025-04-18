
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck, 
  FileCheck, 
  ActivitySquare, 
  FileCog,
  UserCheck,
  Bell
} from "lucide-react";

const MedicalDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Медицинская панель</h1>
      </div>

      <Tabs defaultValue="verification" className="space-y-4">
        <TabsList>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            <span>Верификация</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <FileCog className="h-4 w-4" />
            <span>Рекомендации</span>
          </TabsTrigger>
          <TabsTrigger value="cognitive" className="flex items-center gap-2">
            <ActivitySquare className="h-4 w-4" />
            <span>Когнитивные тесты</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            <span>График проверок</span>
          </TabsTrigger>
        </TabsList>

        {/* Верификация результатов */}
        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Верификация результатов анализа</CardTitle>
              <CardDescription>
                Проверьте результаты автоматического анализа усталости
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Запись 1 */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-2 items-center">
                      <UserCheck className="text-primary h-5 w-5" />
                      <span className="font-medium">Иван Петров</span>
                      <Badge variant="outline">Капитан</Badge>
                    </div>
                    <Badge className="bg-yellow-500">На проверке</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Рейс</p>
                      <p>SU1234 (MOW → LED)</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Дата</p>
                      <p>15.04.2025</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Время</p>
                      <p>14:30 - 16:15</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Анализ ИИ</p>
                      <p className="text-yellow-500 font-medium">Средняя усталость (65%)</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">Посмотреть видео</Button>
                    <Button size="sm">Верифицировать</Button>
                  </div>
                </div>

                {/* Запись 2 */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-2 items-center">
                      <UserCheck className="text-primary h-5 w-5" />
                      <span className="font-medium">Анна Кузнецова</span>
                      <Badge variant="outline">Второй пилот</Badge>
                    </div>
                    <Badge className="bg-yellow-500">На проверке</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Рейс</p>
                      <p>SU5678 (MOW → KZN)</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Дата</p>
                      <p>15.04.2025</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Время</p>
                      <p>10:15 - 12:00</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Анализ ИИ</p>
                      <p className="text-red-500 font-medium">Высокая усталость (82%)</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">Посмотреть видео</Button>
                    <Button size="sm">Верифицировать</Button>
                  </div>
                </div>

                {/* Запись 3 */}
                <div className="border rounded-lg p-4 bg-muted/20">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-2 items-center">
                      <UserCheck className="text-primary h-5 w-5" />
                      <span className="font-medium">Сергей Михайлов</span>
                      <Badge variant="outline">Капитан</Badge>
                    </div>
                    <Badge className="bg-green-500">Проверено</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Рейс</p>
                      <p>SU9012 (MOW → AER)</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Дата</p>
                      <p>14.04.2025</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Время</p>
                      <p>08:45 - 11:20</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Окончательный анализ</p>
                      <p className="text-green-500 font-medium">Низкая усталость (35%)</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <div className="text-sm text-muted-foreground">Всего: 12 записей</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>Назад</Button>
                <Button variant="outline" size="sm">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">Вперед</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Остальные вкладки */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Назначение рекомендаций</CardTitle>
              <CardDescription>
                Создавайте индивидуальные рекомендации для членов экипажа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Здесь будет интерфейс для создания и назначения индивидуальных рекомендаций
              </p>
              <div className="h-[400px] flex justify-center items-center border rounded-md mt-4 bg-muted/20">
                <span className="text-muted-foreground">Панель назначения рекомендаций</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cognitive">
          <Card>
            <CardHeader>
              <CardTitle>Когнитивные тесты</CardTitle>
              <CardDescription>
                Расширенная статистика по когнитивным тестам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Здесь будет отображаться расширенная аналитика когнитивных тестов
              </p>
              <div className="h-[400px] flex justify-center items-center border rounded-md mt-4 bg-muted/20">
                <span className="text-muted-foreground">Аналитика когнитивных тестов</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>График медицинских проверок</CardTitle>
              <CardDescription>
                Управление расписанием медицинских осмотров
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Здесь будет интерфейс для планирования и управления медицинскими проверками
              </p>
              <div className="h-[400px] flex justify-center items-center border rounded-md mt-4 bg-muted/20">
                <span className="text-muted-foreground">График медицинских проверок</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalDashboard;
