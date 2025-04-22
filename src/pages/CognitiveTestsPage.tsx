
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, ActivitySquare, MousePointer, Timer } from "lucide-react";
import { TestCard } from "@/components/cognitive-tests/TestCard";
import { TestDialog } from "@/components/cognitive-tests/TestDialog";
import { ResultsDialog } from "@/components/cognitive-tests/ResultsDialog";
import { useCognitiveTest } from "@/hooks/useCognitiveTest";
import { useTestHistory } from "@/hooks/useTestHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

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
  },
  {
    id: "cognitive",
    name: "Тест когнитивных способностей",
    description: "Оценка скорости обработки информации и принятия решений",
    duration: "3 минуты",
    icon: <Timer className="h-5 w-5" />
  }
];

const CognitiveTestsPage = () => {
  const isMobile = useIsMobile();
  const { isAuthenticated, refreshToken } = useAuth();
  
  useEffect(() => {
    // Обновляем токен при входе на страницу
    if (isAuthenticated) {
      refreshToken().catch(console.error);
    }
  }, [isAuthenticated, refreshToken]);
  
  const {
    activeTestId,
    testInProgress,
    testComplete,
    currentTestSession,
    testResults,
    isLoading: testLoading,
    startTest,
    handleAnswer,
    closeTest,
    handleTimeUp
  } = useCognitiveTest();

  const {
    testHistory,
    showResultDetails,
    setShowResultDetails,
    selectedTestResults,
    isLoading: historyLoading,
    getLastResult,
    viewTestDetails,
  } = useTestHistory();

  const activeTestConfig = testConfig.find(t => t.id === activeTestId);

  const handleStartTest = () => {
    if (activeTestId) {
      startTest(activeTestId);
    }
  };

  const handleRetryTest = (testId: string) => {
    setShowResultDetails(false);
    setTimeout(() => startTest(testId), 300);
  };

  const renderTestCards = (mode?: 'compact') => {
    if (historyLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 border rounded-lg space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
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
            mode={mode}
          />
        ))}
      </div>
    );
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
          {renderTestCards()}
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4 animate-fade-in">
          {renderTestCards('compact')}
        </TabsContent>
      </Tabs>
      
      <TestDialog
        isOpen={activeTestId !== null}
        testConfig={activeTestConfig}
        testInProgress={testInProgress}
        testComplete={testComplete}
        currentTestSession={currentTestSession}
        testResults={testResults}
        isLoading={testLoading}
        onClose={closeTest}
        onStart={handleStartTest}
        onAnswer={handleAnswer}
        onTimeUp={handleTimeUp}
      />
      
      <ResultsDialog
        isOpen={showResultDetails}
        testResults={selectedTestResults}
        onClose={() => setShowResultDetails(false)}
        onRetry={() => activeTestId && handleRetryTest(activeTestId)}
      />
    </div>
  );
};

export default CognitiveTestsPage;
