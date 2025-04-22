
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Brain, ActivitySquare, MousePointer, BarChart } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { TestCard } from "@/components/cognitive-tests/TestCard";
import { TestProgress } from "@/components/cognitive-tests/TestProgress";
import { TestQuestion } from "@/components/cognitive-tests/TestQuestion";
import { TestResults } from "@/components/cognitive-tests/TestResults";
import { cognitiveTestsApi } from "@/api/cognitiveTestsApi";
import { TestHistory, TestQuestion as TestQuestionType, TestResult } from "@/types/cognitivetests";

// Конфигурация доступных тестов
const testConfig = [
  {
    id: "attention",
    name: "Тест внимания",
    description: "Проверка способности концентрироваться и распределять внимание",
    duration: "3 минуты",
    icon: <Brain className="h-5 w-5" />
  },
  {
    id: "reaction",
    name: "Тест реакции",
    description: "Измерение скорости реакции на визуальные стимулы",
    duration: "2 минуты",
    icon: <MousePointer className="h-5 w-5" />
  },
  {
    id: "memory",
    name: "Тест памяти",
    description: "Проверка кратковременной памяти и способности к запоминанию",
    duration: "4 минуты",
    icon: <ActivitySquare className="h-5 w-5" />
  }
];

// Компонент страницы когнитивных тестов
const CognitiveTestsPage = () => {
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [testInProgress, setTestInProgress] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [currentTestSession, setCurrentTestSession] = useState<{
    testId: string;
    questions: TestQuestionType[];
    timeLimit: number;
    currentQuestion: number;
    answers: Record<string, string>;
  } | null>(null);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [showResultDetails, setShowResultDetails] = useState(false);
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isMobile = useIsMobile();
  
  // Загрузка истории тестов при монтировании
  useEffect(() => {
    const fetchTestHistory = async () => {
      try {
        const history = await cognitiveTestsApi.getTestHistory();
        setTestHistory(history);
      } catch (error) {
        console.error("Failed to fetch test history:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить историю тестов",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTestHistory();
  }, []);
  
  // Получить последний результат теста из истории
  const getLastResult = (testType: string) => {
    const results = testHistory.filter(test => test.test_type === testType);
    if (results.length === 0) return null;
    
    results.sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime());
    const lastTest = results[0];
    
    // Определение статуса на основе оценки
    let status = "failed";
    if (lastTest.score >= 85) status = "passed";
    else if (lastTest.score >= 70) status = "warning";
    
    return {
      status,
      score: lastTest.score,
      date: new Date(lastTest.test_date).toLocaleDateString('ru-RU'),
      errors: []
    };
  };
  
  // Начать тест
  const startTest = async (testId: string) => {
    try {
      setIsLoading(true);
      setActiveTestId(testId);
      
      const session = await cognitiveTestsApi.startTest(testId);
      
      setCurrentTestSession({
        testId: session.test_id,
        questions: session.questions,
        timeLimit: session.time_limit,
        currentQuestion: 0,
        answers: {}
      });
      
      setTestInProgress(true);
      setTestComplete(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to start test:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось начать тест",
        variant: "destructive"
      });
      setActiveTestId(null);
      setIsLoading(false);
    }
  };
  
  // Обработка ответа на вопрос
  const handleAnswer = (questionId: string, answer: string) => {
    if (!currentTestSession) return;
    
    const updatedAnswers = {
      ...currentTestSession.answers,
      [questionId]: answer
    };
    
    const nextQuestion = currentTestSession.currentQuestion + 1;
    
    // Если это последний вопрос, завершаем тест
    if (nextQuestion >= currentTestSession.questions.length) {
      submitTest(currentTestSession.testId, updatedAnswers);
    } else {
      // Переходим к следующему вопросу
      setCurrentTestSession({
        ...currentTestSession,
        currentQuestion: nextQuestion,
        answers: updatedAnswers
      });
    }
  };
  
  // Отправка результатов теста
  const submitTest = async (testId: string, answers: Record<string, string>) => {
    try {
      setIsLoading(true);
      
      const result = await cognitiveTestsApi.submitTest(testId, answers);
      
      // Получение полных результатов теста
      const fullResults = await cognitiveTestsApi.getTestResults(result.test_id);
      
      setTestResults(fullResults);
      setTestInProgress(false);
      setTestComplete(true);
      
      // Обновление истории тестов
      const updatedHistory = await cognitiveTestsApi.getTestHistory();
      setTestHistory(updatedHistory);
      
      toast({
        title: "Тест завершен",
        description: `Ваш результат: ${result.score}%`,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to submit test:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить результаты теста",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Завершение по истечению времени
  const handleTimeUp = () => {
    if (!currentTestSession) return;
    
    toast({
      title: "Время истекло",
      description: "Тест будет автоматически завершен",
    });
    
    submitTest(currentTestSession.testId, currentTestSession.answers);
  };
  
  // Закрыть тест
  const closeTest = () => {
    setActiveTestId(null);
    setTestInProgress(false);
    setTestComplete(false);
    setCurrentTestSession(null);
    setTestResults(null);
  };
  
  // Посмотреть детали результата
  const viewTestDetails = async (testId: string) => {
    try {
      setIsLoading(true);
      
      // Найти последний тест данного типа
      const tests = testHistory.filter(test => test.test_type === testId);
      if (tests.length === 0) {
        toast({
          title: "Информация",
          description: "У вас еще нет результатов для этого теста",
        });
        setIsLoading(false);
        return;
      }
      
      // Сортировка по дате (от новых к старым)
      tests.sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime());
      const lastTestId = tests[0].test_id;
      
      // Получение детальных результатов
      const result = await cognitiveTestsApi.getTestResults(lastTestId);
      setTestResults(result);
      setShowResultDetails(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to get test results:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить результаты теста",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Текущий вопрос
  const currentQuestion = currentTestSession 
    ? currentTestSession.questions[currentTestSession.currentQuestion]
    : null;
  
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
            {testConfig.map((test) => (
              <TestCard
                key={test.id}
                id={test.id}
                name={test.name}
                description={test.description}
                duration={test.duration}
                lastResult={getLastResult(test.id)}
                icon={test.icon}
                onStartTest={startTest}
                onViewResults={viewTestDetails}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4 animate-fade-in">
          {testConfig.map((test) => (
            <TestCard
              key={test.id}
              id={test.id}
              name={test.name}
              description={test.description}
              duration={test.duration}
              lastResult={getLastResult(test.id)}
              icon={test.icon}
              onStartTest={startTest}
              onViewResults={viewTestDetails}
              mode="compact"
            />
          ))}
        </TabsContent>
      </Tabs>
      
      {/* Модальное окно активного теста */}
      <Dialog open={activeTestId !== null} onOpenChange={(open) => !open && closeTest()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {testConfig.find(t => t.id === activeTestId)?.name}
            </DialogTitle>
            <DialogDescription>
              {testInProgress 
                ? "Выполнение теста..." 
                : testComplete 
                  ? "Тест завершен" 
                  : "Готовы начать тест?"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {testInProgress && currentTestSession && (
              <div className="space-y-4">
                <TestProgress 
                  timeLimit={currentTestSession.timeLimit}
                  onTimeUp={handleTimeUp}
                />
                
                {currentQuestion && (
                  <TestQuestion
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                    disabled={isLoading}
                  />
                )}
              </div>
            )}
            
            {testComplete && testResults && (
              <TestResults
                result={testResults}
                onClose={closeTest}
              />
            )}
            
            {!testInProgress && !testComplete && (
              <Card>
                <CardHeader>
                  <CardTitle>О тесте</CardTitle>
                  <CardDescription>
                    {testConfig.find(t => t.id === activeTestId)?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Приготовьтесь к прохождению теста. Во время теста будьте внимательны и сосредоточены.
                    Рекомендуется находиться в тихом помещении без отвлекающих факторов.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          
          <DialogFooter>
            {!testInProgress && !testComplete && (
              <>
                <Button variant="outline" onClick={closeTest} disabled={isLoading}>Отмена</Button>
                <Button onClick={() => startTest(activeTestId!)} disabled={isLoading}>
                  {isLoading ? "Загрузка..." : "Начать тест"}
                </Button>
              </>
            )}
            
            {testInProgress && (
              <Button variant="outline" onClick={closeTest} disabled={isLoading}>Отменить тест</Button>
            )}
            
            {testComplete && !testResults && (
              <Button onClick={closeTest} disabled={isLoading}>Закрыть</Button>
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
          
          {testResults && (
            <TestResults
              result={testResults}
              onClose={() => setShowResultDetails(false)}
              onRetry={() => {
                setShowResultDetails(false);
                const testType = testResults.test_type;
                setTimeout(() => startTest(testType), 300);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CognitiveTestsPage;
