import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Brain, MousePointer, ActivitySquare } from "lucide-react";
import TestCard from "@/components/cognitive-tests/TestCard";
import TestProgress from "@/components/cognitive-tests/TestProgress";
import TestQuestion from "@/components/cognitive-tests/TestQuestion";
import TestResults from "@/components/cognitive-tests/TestResults";
import { cognitiveTestsApi, TestQuestion as ITestQuestion, TestResult } from "@/api/cognitiveTests";

const availableTests = [
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

const CognitiveTestsPage = () => {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ITestQuestion | null>(null);
  const [questions, setQuestions] = useState<ITestQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const startTest = async (testId: string) => {
    try {
      const session = await cognitiveTestsApi.startTest(testId);
      setActiveTest(session.test_id);
      setQuestions(session.questions);
      setCurrentQuestion(session.questions[0]);
      setAnswers({});
      setShowResults(false);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось начать тест. Попробуйте позже.",
        variant: "destructive",
      });
    }
  };

  const handleAnswer = async (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex < questions.length - 1) {
      setCurrentQuestion(questions[currentIndex + 1]);
    } else {
      try {
        const result = await cognitiveTestsApi.submitTest(activeTest!, newAnswers);
        setTestResult(result);
        setShowResults(true);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось отправить результаты теста.",
          variant: "destructive",
        });
      }
    }
  };

  const viewTestResults = async (testId: string) => {
    try {
      const result = await cognitiveTestsApi.getTestResults(Number(testId));
      setTestResult(result);
      setShowResults(true);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить результаты теста.",
        variant: "destructive",
      });
    }
  };

  const closeTest = () => {
    setActiveTest(null);
    setCurrentQuestion(null);
    setQuestions([]);
    setAnswers({});
    setTestResult(null);
    setShowResults(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Когнитивные тесты</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableTests.map((test) => (
          <TestCard
            key={test.id}
            {...test}
            onStartTest={startTest}
            onViewResults={viewTestResults}
          />
        ))}
      </div>

      <Dialog open={activeTest !== null} onOpenChange={() => activeTest && closeTest()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {availableTests.find(t => t.id === activeTest)?.name}
            </DialogTitle>
            <DialogDescription>
              {showResults ? "Результаты теста" : "Выполнение теста"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {!showResults && currentQuestion && (
              <div className="space-y-4">
                <TestProgress
                  current={Object.keys(answers).length}
                  total={questions.length}
                />
                <TestQuestion
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                />
              </div>
            )}

            {showResults && testResult && (
              <TestResults
                score={testResult.score}
                mistakes={testResult.mistakes}
                testType={availableTests.find(t => t.id === activeTest)?.name || ""}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CognitiveTestsPage;
