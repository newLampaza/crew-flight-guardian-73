
import { useState } from "react";
import { TestHistory, TestQuestion, TestResult, TestResultSummary } from "@/types/cognitivetests";
import { cognitiveTestsApi } from "@/api/cognitiveTestsApi";
import { toast } from "@/components/ui/use-toast";

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
  const [isLoading, setIsLoading] = useState(true);

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
    }
  };

  const submitTest = async (testId: string, answers: Record<string, string>) => {
    try {
      setIsLoading(true);
      
      const result = await cognitiveTestsApi.submitTest(testId, answers);
      const fullResults = await cognitiveTestsApi.getTestResults(result.test_id);
      
      setTestResults(fullResults);
      setTestInProgress(false);
      setTestComplete(true);
      
      toast({
        title: "Тест завершен",
        description: `Ваш результат: ${result.score}%`,
      });
      
      setIsLoading(false);
      return fullResults;
    } catch (error) {
      console.error("Failed to submit test:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить результаты теста",
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
