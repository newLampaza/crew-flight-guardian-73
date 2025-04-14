
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, CheckCircle, AlertTriangle, XCircle, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const tests = [
  {
    id: "attention",
    name: "Тест внимания",
    description: "Оценка способности сосредоточиться на задаче",
    duration: "5 минут",
    lastCompleted: "13 апреля 2025",
    status: "passed",
    score: 92
  },
  {
    id: "reaction",
    name: "Тест реакции",
    description: "Измерение скорости реакции на визуальные стимулы",
    duration: "3 минуты",
    lastCompleted: "13 апреля 2025",
    status: "passed",
    score: 87
  },
  {
    id: "memory",
    name: "Тест памяти",
    description: "Оценка кратковременной памяти и запоминания",
    duration: "8 минут",
    lastCompleted: "10 апреля 2025",
    status: "warning",
    score: 68
  },
  {
    id: "cognitive-flexibility",
    name: "Тест когнитивной гибкости",
    description: "Оценка способности адаптироваться к изменяющимся условиям",
    duration: "10 минут",
    lastCompleted: "9 апреля 2025",
    status: "failed",
    score: 45
  }
];

const TestCard = ({ test }: { test: any }) => {
  const [isTestStarted, setIsTestStarted] = useState(false);
  
  const startTest = () => {
    setIsTestStarted(true);
    
    // Simulate test completion after 2 seconds
    setTimeout(() => {
      setIsTestStarted(false);
      
      toast({
        title: "Тест завершен",
        description: `Тест ${test.name} успешно пройден`,
      });
    }, 2000);
  };
  
  return (
    <Card key={test.id} className="mb-4 hover-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {test.name}
          </CardTitle>
          
          <Badge
            variant={
              test.status === "passed" ? "default" :
              test.status === "warning" ? "secondary" :
              test.status === "failed" ? "destructive" : "outline"
            }
          >
            {test.status === "passed" ? "Пройден" :
             test.status === "warning" ? "Требуется повторный тест" :
             test.status === "failed" ? "Не пройден" : test.status}
          </Badge>
        </div>
        <CardDescription>{test.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              Продолжительность: {test.duration}
            </div>
            
            <div className="text-sm text-muted-foreground">
              Последнее прохождение: {test.lastCompleted}
            </div>
          </div>
          
          {test.status !== "failed" && (
            <div className="flex items-center">
              <span className="mr-2 font-medium">Результат:</span>
              <span 
                className={
                  test.score >= 80 ? "text-status-good" :
                  test.score >= 60 ? "text-status-warning" :
                  "text-status-danger"
                }
              >
                {test.score}/100
              </span>
              <div className="ml-auto">
                {test.status === "passed" ? 
                  <CheckCircle className="h-5 w-5 text-status-good" /> :
                  test.status === "warning" ? 
                  <AlertTriangle className="h-5 w-5 text-status-warning" /> :
                  <XCircle className="h-5 w-5 text-status-danger" />
                }
              </div>
            </div>
          )}
          
          <Button 
            onClick={startTest} 
            disabled={isTestStarted}
            className="w-full"
          >
            {isTestStarted ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Тест выполняется...
              </span>
            ) : (
              "Начать тест"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const TestHistoryItem = ({ test, date, score, result }: { test: string, date: string, score: number, result: string }) => {
  return (
    <div className="flex items-center py-3 border-b last:border-0">
      <div className="flex-1">
        <p className="font-medium">{test}</p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
      <div className="flex items-center gap-2">
        <span 
          className={`font-medium ${
            result === "Пройден" ? "text-status-good" :
            result === "Требуется повторный тест" ? "text-status-warning" :
            "text-status-danger"
          }`}
        >
          {score}/100
        </span>
        <Badge
          variant={
            result === "Пройден" ? "default" :
            result === "Требуется повторный тест" ? "secondary" :
            "destructive"
          }
        >
          {result}
        </Badge>
      </div>
    </div>
  );
};

const CognitiveTestsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Когнитивные тесты</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              Информация о тестах
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Информация о когнитивных тестах</DialogTitle>
              <DialogDescription>
                Когнитивные тесты помогают оценить важные психические функции, необходимые для безопасного выполнения полетов.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-4">
              <p className="text-sm">
                Регулярное тестирование позволяет:
              </p>
              <ul className="list-disc list-inside text-sm">
                <li>Выявлять признаки утомления</li>
                <li>Оценивать когнитивные способности</li>
                <li>Определять готовность к полету</li>
                <li>Предотвращать ситуации, связанные с человеческим фактором</li>
              </ul>
              <p className="text-sm">
                Тесты разработаны на основе научных исследований и соответствуют международным стандартам оценки когнитивных функций.
              </p>
            </div>
            <DialogFooter>
              <Button>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tests">Доступные тесты</TabsTrigger>
          <TabsTrigger value="history">История тестирования</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tests" className="space-y-4">
          {tests.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>История прохождения тестов</CardTitle>
              <CardDescription>
                Результаты всех пройденных тестов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestHistoryItem 
                test="Тест внимания" 
                date="13 апреля 2025, 08:15" 
                score={92} 
                result="Пройден"
              />
              <TestHistoryItem 
                test="Тест реакции" 
                date="13 апреля 2025, 08:22" 
                score={87} 
                result="Пройден"
              />
              <TestHistoryItem 
                test="Тест памяти" 
                date="10 апреля 2025, 15:45" 
                score={68} 
                result="Требуется повторный тест"
              />
              <TestHistoryItem 
                test="Тест когнитивной гибкости" 
                date="9 апреля 2025, 14:10" 
                score={45} 
                result="Не пройден"
              />
              <TestHistoryItem 
                test="Тест внимания" 
                date="8 апреля 2025, 09:30" 
                score={89} 
                result="Пройден"
              />
              <TestHistoryItem 
                test="Тест реакции" 
                date="8 апреля 2025, 09:45" 
                score={85} 
                result="Пройден"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CognitiveTestsPage;
