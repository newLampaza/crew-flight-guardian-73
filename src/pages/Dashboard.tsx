
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  PlaneTakeoff, 
  Clock, 
  Brain, 
  Stethoscope, 
  Battery,
  Activity,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";

// Sample data - in a real app this would come from an API
const crewData = [
  { id: 1, name: "Анна Смирнова", position: "Второй пилот" },
  { id: 2, name: "Сергей Иванов", position: "Бортинженер" },
  { id: 3, name: "Елена Козлова", position: "Старший бортпроводник" },
  { id: 4, name: "Михаил Сидоров", position: "Бортпроводник" }
];

const flightStats = {
  weeklyFlights: 5,
  weeklyHours: 24,
  monthlyFlights: 18,
  monthlyHours: 92
};

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Employee Profile Section */}
      <div className="mb-8">
        <Card className="hover-card bg-gradient-to-br from-sidebar-primary/10 to-sidebar/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl font-bold tracking-tight">
                  Добро пожаловать, {user?.name}
                </h1>
                <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-muted-foreground">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <PlaneTakeoff className="h-4 w-4" />
                    <span>{user?.position}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Users className="h-4 w-4" />
                    <span>{user?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Flight Statistics */}
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <PlaneTakeoff className="h-5 w-5 text-primary" />
              Статистика полетов
            </CardTitle>
            <CardDescription>Текущая неделя и месяц</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Количество полетов за неделю</span>
                <span className="font-bold">{flightStats.weeklyFlights}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Налет часов за неделю</span>
                <span className="font-bold">{flightStats.weeklyHours} ч</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Количество полетов за месяц</span>
                <span className="font-bold">{flightStats.monthlyFlights}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Налет часов за месяц</span>
                <span className="font-bold">{flightStats.monthlyHours} ч</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Current Crew */}
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Текущий экипаж
            </CardTitle>
            <CardDescription>Рейс SU-1492, Москва - Санкт-Петербург</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {crewData.map(member => (
                <div key={member.id} className="flex justify-between items-center">
                  <span className="crew-name">{member.name}</span>
                  <span className="crew-position">{member.position}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Flight Status */}
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Текущий полет
            </CardTitle>
            <CardDescription>Информация о рейсе</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="font-bold text-lg">SU-1492</p>
                <p>Москва (SVO) - Санкт-Петербург (LED)</p>
                <p className="text-sm text-muted-foreground">2 часа 20 минут</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Status Checks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cognitive Tests */}
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Когнитивные тесты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-good"></span>
                  <span>Тест внимания</span>
                </div>
                <span className="font-bold text-status-good status-text">Пройден</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-good"></span>
                  <span>Тест реакции</span>
                </div>
                <span className="font-bold text-status-good status-text">Пройден</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-warning"></span>
                  <span>Тест памяти</span>
                </div>
                <span className="font-bold text-status-warning status-text">Требуется повторный тест</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-danger"></span>
                  <span>Тест когнитивной гибкости</span>
                </div>
                <span className="font-bold text-status-danger status-text">Не пройден</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Medical Check */}
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Медицинский контроль
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-good"></span>
                  <span>Допуск к полетам</span>
                </div>
                <span className="font-bold text-status-good status-text">Разрешен</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-good"></span>
                  <span>Дата медосмотра</span>
                </div>
                <span className="font-bold status-text">10.04.2025</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-good"></span>
                  <span>Следующий осмотр</span>
                </div>
                <span className="font-bold status-text">10.10.2025</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="status-indicator status-good"></span>
                  <span>Врач</span>
                </div>
                <span className="font-bold status-text">Петров А.И.</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Fatigue Analysis - улучшенная версия */}
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Battery className="h-5 w-5 text-primary" />
              Анализ усталости
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="mb-2 text-5xl font-bold text-status-warning">65%</div>
                <div className="text-sm text-muted-foreground">Средний уровень усталости</div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg mb-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Превышение нормы</p>
                    <p className="text-xs text-muted-foreground">Рекомендуется дополнительный отдых перед следующим рейсом</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm">Динамика за неделю</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-rose-500 mr-1">+5%</span>
                  <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{width: "60%"}}></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center pt-1">
                <Link to="/fatigue-analysis">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Подробный анализ
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
