
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle, XCircle, Clock, BarChart, ActivitySquare, MousePointer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Тестовые данные
const availableTests = [
  {
    id: "attention",
    name: "Тест внимания",
    description: "Проверка способности концентрироваться и распределять внимание",
    duration: "3 минуты",
    icon: <Brain className="h-5 w-5" />,
    lastResult: {
      status: "passed",
      score: 92,
      date: "12.04.2025",
      errors: []
    }
  },
  {
    id: "reaction",
    name: "Тест реакции",
    description: "Измерение скорости реакции на визуальные стимулы",
    duration: "2 минуты",
    icon: <MousePointer className="h-5 w-5" />,
    lastResult: {
      status: "passed",
      score: 95,
      date: "12.04.2025",
      errors: []
    }
  },
  {
    id: "memory",
    name: "Тест памяти",
    description: "Проверка кратковременной памяти и способности к запоминанию",
    duration: "4 минуты",
    icon: <ActivitySquare className="h-5 w-5" />,
    lastResult: {
      status: "warning",
      score: 75,
      date: "10.04.2025",
      errors: [
        "Ошибка при запоминании последовательности цифр",
        "Низкая скорость воспроизведения образов"
      ]
    }
  },
  {
    id: "cognitive",
    name: "Тест когнитивной гибкости",
    description: "Оценка способности к переключению между задачами",
    duration: "5 минут",
    icon: <BarChart className="h-5 w-5" />,
    lastResult: {
      status: "failed",
      score: 60,
      date: "09.04.2025",
      errors: [
        "Высокое время переключения между задачами",
        "Ошибки при смене правил",
        "Низкая скорость адаптации к новым условиям"
      ]
    }
  }
];

// Компонент страницы когнитивных тестов
const CognitiveTestsPage = () => {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testInProgress, setTestInProgress] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [testResult, setTestResult] = useState<any>(null);
  const [showResultDetails, setShowResultDetails] = useState(false);
  
  const isMobile = useIsMobile();
  
  // Начать тест
  const startTest = (testId: string) => {
    setActiveTest(testId);
    setTestInProgress(true);
    setCurrentProgress(0);
    setTestComplete(false);
    
    // Имитация прогресса теста
    const intervalId = setInterval(() => {
      setCurrentProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalId);
          completeTest();
          return 100;
        }
        return prev + 2;
      });
    }, 200);
  };
  
  // Завершение теста
  const completeTest = () => {
    setTestInProgress(false);
    setTestComplete(true);
    
    // Имитация результата теста
    const test = availableTests.find(t => t.id === activeTest);
    if (test && test.lastResult) {
      setTestResult({
        ...test.lastResult,
        date: new Date().toLocaleDateString('ru-RU')
      });
    }
    
    toast({
      title: "Тест завершен",
      description: "Результаты теста готовы к просмотру",
    });
  };
  
  // Закрыть тест
  const closeTest = () => {
    setActiveTest(null);
    setTestInProgress(false);
    setTestComplete(false);
    setCurrentProgress(0);
  };
  
  // Посмотреть детали результата
  const viewTestDetails = (testId: string) => {
    const test = availableTests.find(t => t.id === testId);
    if (test && test.lastResult) {
      setTestResult(test.lastResult);
      setShowResultDetails(true);
    }
  };
  
  // Получить цвет статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed": return "text-status-good";
      case "warning": return "text-status-warning";
      case "failed": return "text-status-danger";
      default: return "text-gray-500";
    }
  };
  
  // Получить текст статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case "passed": return "Пройден";
      case "warning": return "Требуется повторный тест";
      case "failed": return "Не пройден";
      default: return "Нет данных";
    }
  };
  
  // Получить иконку статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed": return <CheckCircle className="h-5 w-5 text-status-good" />;
      case "warning": return <Clock className="h-5 w-5 text-status-warning" />;
      case "failed": return <XCircle className="h-5 w-5 text-status-danger" />;
      default: return null;
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Когнитивные тесты</h1>
      
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="mb-4 w-full flex-wrap">
          <TabsTrigger value="available" className="flex-1">Доступные тесты</TabsTrigger>
          <TabsTrigger value="results" className="flex-1">Результаты</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTests.map((test) => (
              <Card key={test.id} className="hover-card transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 p-2 rounded-full bg-primary/10">
                      {test.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Длительность:</span>
                    <Badge variant="outline" className="font-medium">
                      <Clock className="h-3 w-3 mr-1" /> {test.duration}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Последний результат:</span>
                    <div className="flex items-center">
                      {getStatusIcon(test.lastResult.status)}
                      <span className={`ml-1 text-sm ${getStatusColor(test.lastResult.status)}`}>
                        {getStatusText(test.lastResult.status)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => viewTestDetails(test.id)}
                  >
                    Результаты
                  </Button>
                  <Button 
                    onClick={() => startTest(test.id)}
                    size="sm"
                  >
                    Начать тест
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4 animate-fade-in">
          {availableTests.map((test) => (
            <Card key={test.id} className="hover-card transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {test.icon}
                    {test.name}
                  </CardTitle>
                  <Badge 
                    variant={
                      test.lastResult.status === "passed" ? "outline" : 
                      test.lastResult.status === "warning" ? "secondary" : 
                      "destructive"
                    }
                  >
                    {getStatusText(test.lastResult.status)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Последнее прохождение: {test.lastResult.date}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Результат:</span>
                    <span className="font-bold">{test.lastResult.score}%</span>
                  </div>
                  <Progress value={test.lastResult.score} className="h-2" />
                </div>
                
                {test.lastResult.errors && test.lastResult.errors.length > 0 && (
                  <Alert variant={test.lastResult.status === "warning" ? "warning" : "destructive"}>
                    <AlertTitle>Обнаружены ошибки</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside text-sm mt-2">
                        {test.lastResult.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => startTest(test.id)}
                  className="w-full transition-all duration-300 hover:scale-[1.02]"
                >
                  Пройти повторно
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      
      {/* Модальное окно активного теста */}
      <Dialog open={activeTest !== null} onOpenChange={(open) => !open && closeTest()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {availableTests.find(t => t.id === activeTest)?.name}
            </DialogTitle>
            <DialogDescription>
              {testInProgress ? "Выполнение теста..." : testComplete ? "Тест завершен" : "Готовы начать тест?"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {testInProgress && (
              <div className="space-y-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Прогресс:</span>
                  <span>{currentProgress}%</span>
                </div>
                <Progress value={currentProgress} className="h-2" />
                
                <div className="bg-muted rounded-md p-4 text-center">
                  <p className="text-sm text-muted-foreground">Здесь будет отображаться содержимое теста...</p>
                </div>
              </div>
            )}
            
            {testComplete && testResult && (
              <div className="space-y-4">
                <div className="bg-muted rounded-md p-6 text-center">
                  <div className="text-5xl font-bold mb-2 text-primary">{testResult.score}%</div>
                  <div className="flex items-center justify-center">
                    {getStatusIcon(testResult.status)}
                    <span className={`ml-1 ${getStatusColor(testResult.status)}`}>
                      {getStatusText(testResult.status)}
                    </span>
                  </div>
                </div>
                
                {testResult.errors && testResult.errors.length > 0 && (
                  <Alert variant={testResult.status === "warning" ? "warning" : "destructive"}>
                    <AlertTitle>Обнаружены ошибки</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside text-sm mt-2">
                        {testResult.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            {!testInProgress && !testComplete && (
              <>
                <Button variant="outline" onClick={closeTest}>Отмена</Button>
                <Button onClick={() => startTest(activeTest!)}>Начать тест</Button>
              </>
            )}
            
            {testInProgress && (
              <Button variant="outline" onClick={closeTest}>Отменить тест</Button>
            )}
            
            {testComplete && (
              <Button onClick={closeTest}>Закрыть</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Модальное окно с деталями результата */}
      <Dialog open={showResultDetails} onOpenChange={setShowResultDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Детали результата</DialogTitle>
            <DialogDescription>
              Подробная информация о последнем прохождении теста
            </DialogDescription>
          </DialogHeader>
          
          {testResult && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  {getStatusIcon(testResult.status)}
                </div>
                <div>
                  <div className="font-medium">{getStatusText(testResult.status)}</div>
                  <div className="text-sm text-muted-foreground">Дата: {testResult.date}</div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Общий балл:</span>
                  <span className="font-bold">{testResult.score}%</span>
                </div>
                <Progress value={testResult.score} className="h-2" />
              </div>
              
              {testResult.errors && testResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Обнаруженные проблемы:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {testResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="bg-muted rounded-md p-4">
                <h4 className="font-medium mb-2">Рекомендации:</h4>
                <p className="text-sm text-muted-foreground">
                  {testResult.status === "passed" 
                    ? "Отличный результат! Продолжайте в том же духе."
                    : testResult.status === "warning"
                    ? "Рекомендуется повторно пройти тест в ближайшее время для улучшения показателей."
                    : "Необходимо пройти повторный тест с целью улучшения результатов. Обратите внимание на допущенные ошибки."}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowResultDetails(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CognitiveTestsPage;
