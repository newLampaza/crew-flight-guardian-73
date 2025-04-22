
import { useState, useEffect } from "react";
import { TestHistory, TestResult } from "@/types/cognitivetests";
import { cognitiveTestsApi } from "@/api/cognitiveTestsApi";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useTestHistory = () => {
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [showResultDetails, setShowResultDetails] = useState(false);
  const [selectedTestResults, setSelectedTestResults] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchTestHistory();
    }
  }, [isAuthenticated]);

  const fetchTestHistory = async () => {
    if (!isAuthenticated) {
      setTestHistory([]);
      setIsLoading(false);
      return;
    }
    
    try {
      const history = await cognitiveTestsApi.getTestHistory();
      setTestHistory(Array.isArray(history) ? history : []);
    } catch (error) {
      console.error("Failed to fetch test history:", error);
      
      // Более информативное сообщение об ошибке
      let errorMessage = "Не удалось загрузить историю тестов";
      if (error.response?.status === 401) {
        errorMessage = "Ошибка авторизации. Пожалуйста, войдите в систему снова";
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
      
      setTestHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLastResult = (testType: string) => {
    if (!testHistory || !Array.isArray(testHistory) || testHistory.length === 0) {
      return null;
    }
    
    const results = testHistory.filter(test => test.test_type === testType);
    if (results.length === 0) return null;
    
    results.sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime());
    const lastTest = results[0];
    
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

  const viewTestDetails = async (testId: string) => {
    try {
      setIsLoading(true);
      
      // Ensure testHistory is an array before filtering
      if (!Array.isArray(testHistory)) {
        toast({
          title: "Ошибка",
          description: "История тестов не загружена",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const tests = testHistory.filter(test => test.test_type === testId);
      if (tests.length === 0) {
        toast({
          title: "Информация",
          description: "У вас еще нет результатов для этого теста",
        });
        setIsLoading(false);
        return;
      }
      
      tests.sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime());
      const lastTestId = tests[0].test_id;
      
      const result = await cognitiveTestsApi.getTestResults(lastTestId);
      setSelectedTestResults(result);
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

  return {
    testHistory,
    showResultDetails,
    setShowResultDetails,
    selectedTestResults,
    isLoading,
    getLastResult,
    viewTestDetails,
    refreshHistory: fetchTestHistory
  };
};
