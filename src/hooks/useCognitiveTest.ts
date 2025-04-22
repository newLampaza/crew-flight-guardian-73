
import { useState } from "react";
import { TestHistory, TestQuestion, TestResult, TestResultSummary } from "@/types/cognitivetests";
import { cognitiveTestsApi } from "@/api/cognitiveTestsApi";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useCognitiveTest = () => {
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [testInProgress, setTestInProgress] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [currentTestSession, setCurrentTestSession] = useState<{
    testId: string;
    questions: TestQuestion[];
    timeLimit: number;
    currentQuestion: number;
    answers: Record<string, string>;
  } | null>(null);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user, refreshToken } = useAuth();

  const startTest = async (testId: string) => {
    try {
      // Проверяем, аутентифицирован ли пользователь
      if (!isAuthenticated || !user) {
        toast({
          title: "Ошибка авторизации",
          description: "Пожалуйста, войдите в систему снова",
          variant: "destructive"
        });
        return;
      }

      // Обновляем токен для обеспечения валидности
      try {
        await refreshToken();
      } catch (refreshError) {
        console.error("Не удалось обновить токен:", refreshError);
        toast({
          title: "Ошибка авторизации",
          description: "Не удалось обновить токен. Пожалуйста, войдите снова",
          variant: "destructive"
        });
        return;
      }

      // Проверяем период перезарядки теста
      try {
        const cooldownCheck = await cognitiveTestsApi.checkTestCooldown(testId);
        if (cooldownCheck.in_cooldown) {
          const cooldownEnd = new Date(cooldownCheck.cooldown_end as string);
          const now = new Date();
          const diffMinutes = Math.ceil((cooldownEnd.getTime() - now.getTime()) / (1000 * 60));
          
          toast({
            title: "Тест недоступен",
            description: `Повторное прохождение будет доступно через ${diffMinutes} мин.`,
            variant: "warning"
          });
          return;
        }
      } catch (cooldownError) {
        console.error("Ошибка при проверке перезарядки:", cooldownError);
        // Продолжаем, так как это не критическая ошибка
      }

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

      toast({
        title: "Тест начат",
        description: `Тест состоит из ${session.questions.length} вопросов`,
      });
    } catch (error) {
      console.error("Не удалось начать тест:", error);
      
      // Более информативное сообщение об ошибке
      let errorMessage = "Не удалось начать тест";
      if (error.response?.status === 401) {
        errorMessage = "Ошибка авторизации. Пожалуйста, войдите в систему снова";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
      
      setActiveTestId(null);
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    if (!currentTestSession) return;
    
    const updatedAnswers = {
      ...currentTestSession.answers,
      [questionId]: answer
    };
    
    const nextQuestion = currentTestSession.currentQuestion + 1;
    
    if (nextQuestion >= currentTestSession.questions.length) {
      submitTest(currentTestSession.testId, updatedAnswers);
    } else {
      setCurrentTestSession({
        ...currentTestSession,
        currentQuestion: nextQuestion,
        answers: updatedAnswers
      });

      // Уведомление о прогрессе
      const progress = Math.round((nextQuestion / currentTestSession.questions.length) * 100);
      if (progress % 25 === 0) {
        toast({
          title: `Прогресс: ${progress}%`,
          description: `Выполнено ${nextQuestion} из ${currentTestSession.questions.length} вопросов`,
        });
      }
    }
  };

  const submitTest = async (testId: string, answers: Record<string, string>) => {
    try {
      setIsLoading(true);
      
      // Обновляем токен перед отправкой результатов
      try {
        await refreshToken();
      } catch (refreshError) {
        console.error("Не удалось обновить токен перед отправкой:", refreshError);
      }
      
      const result = await cognitiveTestsApi.submitTest(testId, answers);
      const fullResults = await cognitiveTestsApi.getTestResults(result.test_id);
      
      setTestResults(fullResults);
      setTestInProgress(false);
      setTestComplete(true);
      
      // Более информативное уведомление
      let statusText = "удовлетворительно";
      if (result.score >= 80) statusText = "отлично";
      else if (result.score >= 60) statusText = "хорошо";
      else if (result.score < 40) statusText = "требуется улучшение";
      
      toast({
        title: "Тест завершен",
        description: `Ваш результат: ${result.score}% (${statusText})`,
      });
      
      setIsLoading(false);
      return fullResults;
    } catch (error) {
      console.error("Не удалось отправить результаты теста:", error);
      
      // Обработка различных ошибок
      let errorMessage = "Не удалось отправить результаты теста";
      
      if (error.response?.status === 401) {
        errorMessage = "Ошибка авторизации. Пожалуйста, войдите в систему снова";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
      
      setIsLoading(false);
      return null;
    }
  };

  const closeTest = () => {
    setActiveTestId(null);
    setTestInProgress(false);
    setTestComplete(false);
    setCurrentTestSession(null);
    setTestResults(null);
  };

  const handleTimeUp = () => {
    if (!currentTestSession) return;
    
    toast({
      title: "Время истекло",
      description: "Тест будет автоматически завершен",
      variant: "warning"
    });
    
    submitTest(currentTestSession.testId, currentTestSession.answers);
  };

  return {
    activeTestId,
    testInProgress,
    testComplete,
    currentTestSession,
    testResults,
    isLoading,
    startTest,
    handleAnswer,
    closeTest,
    handleTimeUp
  };
};
