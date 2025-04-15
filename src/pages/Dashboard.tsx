import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Users, PlaneTakeoff, Clock, Brain, Stethoscope, Battery, Activity, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const crewData = [{
  id: 1,
  name: "Анна Смирнова",
  position: "Второй пилот"
}, {
  id: 2,
  name: "Сергей Иванов",
  position: "Бортинженер"
}, {
  id: 3,
  name: "Елена Козлова",
  position: "Старший бортпроводник"
}, {
  id: 4,
  name: "Михаил Сидоров",
  position: "Бортпроводник"
}];

const flightStats = {
  weeklyFlights: 5,
  weeklyHours: 24,
  monthlyFlights: 18,
  monthlyHours: 92
};

const Dashboard = () => {
  const { user } = useAuth();

  const admissionStatus = {
    isAllowed: true,
    nextFlight: "SU-1492",
    nextFlightTime: "15:30",
    reasonIfNotAllowed: null
  };

  return <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <Card className="hover-card bg-gradient-to-br from-sidebar-primary/10 to-sidebar/5">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-3 text-center md:text-left flex-grow">
                <h1 className="text-4xl font-bold tracking-tight leading-tight">
                  Добро пожаловать, {user?.name}
                </h1>
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-muted-foreground text-lg">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <PlaneTakeoff className="h-5 w-5" />
                    <span>{user?.position}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Users className="h-5 w-5" />
                    <span>{user?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="hover-card col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center gap-3">
              <PlaneTakeoff className="h-6 w-6 text-primary" />
              Допуск к полету
            </CardTitle>
            <CardDescription className="text-base">Статус следующего рейса</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="flex items-center justify-center mb-3">
                  {admissionStatus.isAllowed ? (
                    <div className="flex items-center text-status-good">
                      <span className="status-indicator status-good" />
                      <span className="text-lg font-semibold">Допущен</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-status-danger">
                      <span className="status-indicator status-danger" />
                      <span className="text-lg font-semibold">Не допущен</span>
                    </div>
                  )}
                </div>
                <p className="font-bold text-xl mb-2">Рейс {admissionStatus.nextFlight}</p>
                <p className="text-base text-muted-foreground">
                  Вылет в {admissionStatus.nextFlightTime}
                </p>
                {!admissionStatus.isAllowed && admissionStatus.reasonIfNotAllowed && (
                  <div className="mt-3 p-2 bg-destructive/10 rounded text-destructive text-sm">
                    {admissionStatus.reasonIfNotAllowed}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center gap-3">
              <PlaneTakeoff className="h-6 w-6 text-primary" />
              Статистика полетов
            </CardTitle>
            <CardDescription className="text-base">Текущая неделя и месяц</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">Количество полетов за неделю</span>
                <span className="text-xl font-bold">{flightStats.weeklyFlights}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">Налет часов за неделю</span>
                <span className="text-xl font-bold">{flightStats.weeklyHours} ч</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">Количество полетов за месяц</span>
                <span className="text-xl font-bold">{flightStats.monthlyFlights}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">Налет часов за месяц</span>
                <span className="text-xl font-bold">{flightStats.monthlyHours} ч</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              Текущий экипаж
            </CardTitle>
            <CardDescription className="text-base">Рейс SU-1492, Москва - Санкт-Петербург</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crewData.map(member => <div key={member.id} className="flex justify-between items-center">
                  <div className="tooltip-wrapper">
                    <span className="crew-name text-base">{member.name}</span>
                    <span className="tooltip-text">{member.name}</span>
                  </div>
                  <div className="tooltip-wrapper">
                    <span className="crew-position text-base">{member.position}</span>
                    <span className="tooltip-text">{member.position}</span>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              Текущий полет
            </CardTitle>
            <CardDescription className="text-base">Информация о рейсе</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-6 bg-secondary rounded-lg">
                <p className="font-bold text-2xl mb-2">SU-1492</p>
                <p className="text-lg mb-1">Москва (SVO) - Санкт-Петербург (LED)</p>
                <p className="text-base text-muted-foreground">2 часа 20 минут</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Brain className="h-6 w-6 text-primary" />
              Когнитивные тесты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-good"></span>
                  <span className="text-base">Тест внимания</span>
                </div>
                <span className="font-bold text-status-good text-base">Пройден</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-good"></span>
                  <span className="text-base">Тест реакции</span>
                </div>
                <span className="font-bold text-status-good text-base">Пройден</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-warning"></span>
                  <span className="text-base">Тест памяти</span>
                </div>
                <span className="text-status-warning text-base font-bold text-right">Требуется повторный тест</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-danger"></span>
                  <span className="text-base">Тест когнитивной гибкости</span>
                </div>
                <span className="font-bold text-status-danger text-base text-right">Не пройден</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Stethoscope className="h-6 w-6 text-primary" />
              Медицинский контроль
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-good"></span>
                  <span className="text-base">Допуск к полетам</span>
                </div>
                <span className="font-bold text-status-good text-base">Разрешен</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-good"></span>
                  <span className="text-base">Дата медосмотра</span>
                </div>
                <span className="font-bold text-base">10.04.2025</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-good"></span>
                  <span className="text-base">Следующий осмотр</span>
                </div>
                <span className="font-bold text-base">10.10.2025</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-good"></span>
                  <span className="text-base">Врач</span>
                </div>
                <span className="font-bold text-base">Петров А.И.</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Battery className="h-6 w-6 text-primary" />
              Анализ усталости
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="flex flex-col items-center">
                <div className="mb-3 text-6xl font-bold text-status-warning">65%</div>
                <div className="text-base text-muted-foreground">Средний уровень усталости</div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-base font-medium">Превышение нормы</p>
                    <p className="text-sm text-muted-foreground">Рекомендуется дополнительный отдых перед следующим рейсом</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-primary mr-2" />
                  <span className="text-base">Динамика за неделю</span>
                </div>
                <div className="flex items-center">
                  <span className="text-rose-500 mr-2 text-base">+5%</span>
                  <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{
                    width: "60%"
                  }}></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Link to="/fatigue-analysis">
                  <Button variant="ghost" size="default" className="text-base">
                    Подробный анализ
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};

export default Dashboard;
