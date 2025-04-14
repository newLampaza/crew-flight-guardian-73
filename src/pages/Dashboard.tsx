
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Clock, 
  ChevronsUpDown, 
  AlertTriangle,
  Calendar, 
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Function to get the current date in a readable format
const getCurrentDate = () => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return today.toLocaleDateString('ru-RU', options);
};

// Sample user data
const currentUser = {
  id: "user-1",
  name: "Иван Петров",
  position: "Второй пилот",
  avatar: "/avatars/01.png",
  cognitiveScore: 7.8,
  alertness: 8.2,
  attention: 7.5,
  decisionMaking: 8.0,
  status: "warning",
  statusText: "Требуется повторный тест"
};

// Sample crew data
const crew = [
  {
    id: "crew-1",
    name: "Анна Смирнова",
    position: "Командир экипажа",
    avatar: "/avatars/02.png",
    cognitiveScore: 8.5,
    status: "good",
    statusText: "В норме"
  },
  {
    id: "crew-2",
    name: "Дмитрий Иванов",
    position: "Штурман",
    avatar: "/avatars/03.png",
    cognitiveScore: 6.2,
    status: "danger",
    statusText: "Критическое состояние"
  },
  {
    id: "crew-3",
    name: "Елена Кузнецова",
    position: "Бортинженер",
    avatar: "/avatars/04.png",
    cognitiveScore: 7.9,
    status: "warning",
    statusText: "Повышенная усталость"
  }
];

const Dashboard = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Добро пожаловать, Иван</h1>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span>{getCurrentDate()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Состояние экипажа</CardTitle>
            <CardDescription>Общая оценка когнитивных функций экипажа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {crew.map((member) => (
              <div key={member.id} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className={isMobile ? "text-sm font-medium" : "crew-name"}>{member.name}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{member.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className={isMobile ? "text-xs text-muted-foreground" : "crew-position"}>{member.position}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{member.position}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 mr-4">
                      <Progress value={member.cognitiveScore * 10} className="h-2" />
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              <span className={`status-indicator ${member.status === "good" ? "status-good" : member.status === "warning" ? "status-warning" : "status-danger"}`} />
                              <span className={isMobile ? "text-xs" : "text-xs status-text"}>
                                {member.statusText}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{member.statusText}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Badge variant="outline">{member.cognitiveScore.toFixed(1)}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ваши показатели</CardTitle>
              <CardDescription>Общая оценка: {currentUser.cognitiveScore.toFixed(1)}/10</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Бдительность</span>
                  <span className="font-medium">{currentUser.alertness.toFixed(1)}</span>
                </div>
                <Progress value={currentUser.alertness * 10} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Внимание</span>
                  <span className="font-medium">{currentUser.attention.toFixed(1)}</span>
                </div>
                <Progress value={currentUser.attention * 10} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Принятие решений</span>
                  <span className="font-medium">{currentUser.decisionMaking.toFixed(1)}</span>
                </div>
                <Progress value={currentUser.decisionMaking * 10} className="h-2" />
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center mt-4 text-status-warning">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {currentUser.statusText}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Требуется повторное тестирование</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button className="w-full mt-2">
                <Brain className="mr-2 h-4 w-4" />
                Пройти тест
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Анализ усталости</CardTitle>
              <CardDescription>Последнее обновление: 2 часа назад</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Часы на дежурстве: 4ч 30м</span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-primary" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Текущий уровень усталости</span>
                  <span className="font-medium">3.2/10</span>
                </div>
                <Progress value={32} className="h-2" />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <p className="font-medium">Прогноз через 2 часа:</p>
                  <p className="text-muted-foreground">Умеренная усталость (5.1/10)</p>
                </div>
                <Badge variant="outline" className="ml-2">+1.9</Badge>
              </div>
              
              <Button variant="outline" className="w-full mt-2">
                Подробный анализ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
