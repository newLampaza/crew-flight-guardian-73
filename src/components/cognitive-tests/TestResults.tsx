
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface TestResultsProps {
  score: number;
  mistakes?: Array<{
    question: string;
    user_answer: string;
    correct_answer: string;
  }>;
  testType: string;
}

const TestResults: React.FC<TestResultsProps> = ({ score, mistakes, testType }) => {
  const getStatusIcon = () => {
    if (score >= 90) return <CheckCircle className="h-8 w-8 text-green-500" />;
    if (score >= 75) return <Clock className="h-8 w-8 text-yellow-500" />;
    return <XCircle className="h-8 w-8 text-red-500" />;
  };

  const getStatusText = () => {
    if (score >= 90) return "Отличный результат!";
    if (score >= 75) return "Хороший результат";
    return "Требуется улучшение";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Результаты теста: {testType}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center space-x-4">
            {getStatusIcon()}
            <div className="text-center">
              <div className="text-4xl font-bold">{score}%</div>
              <div className="text-sm text-muted-foreground">{getStatusText()}</div>
            </div>
          </div>
          
          <Progress value={score} className="h-2" />

          {mistakes && mistakes.length > 0 && (
            <Alert variant={score >= 75 ? "warning" : "destructive"}>
              <AlertTitle>Допущенные ошибки</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {mistakes.map((mistake, index) => (
                    <li key={index} className="text-sm">
                      Вопрос: {mistake.question}<br />
                      Ваш ответ: {mistake.user_answer}<br />
                      Правильный ответ: {mistake.correct_answer}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResults;
