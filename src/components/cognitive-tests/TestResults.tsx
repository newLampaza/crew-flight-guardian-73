
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { TestResult } from '@/types/cognitivetests';

interface TestResultsProps {
  result: TestResult;
  onClose: () => void;
  onRetry?: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({ result, onClose, onRetry }) => {
  // Получить статус теста на основе оценки
  const getTestStatus = (score: number) => {
    if (score >= 85) return "passed";
    if (score >= 70) return "warning";
    return "failed";
  };
  
  const status = getTestStatus(result.score);
  
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
  
  // Форматировать дату и время
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Форматировать время в секундах в мм:сс
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted rounded-md p-6 text-center">
        <div className="text-5xl font-bold mb-2 text-primary">{result.score}%</div>
        <div className="flex items-center justify-center">
          {getStatusIcon(status)}
          <span className={`ml-1 ${getStatusColor(status)}`}>
            {getStatusText(status)}
          </span>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Детали теста</CardTitle>
          <CardDescription>
            {formatDateTime(result.test_date)} • Длительность: {formatDuration(result.duration)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Результат:</span>
              <span className="font-bold">{result.score}%</span>
            </div>
            <Progress value={result.score} className="h-2" />
          </div>
          
          {result.mistakes && result.mistakes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Ошибки ({result.mistakes.length}):</h4>
              <div className="space-y-3">
                {result.mistakes.map((mistake, index) => (
                  <Alert key={index} variant="destructive" className="py-3">
                    <div className="flex items-start">
                      <XCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <AlertTitle className="text-sm font-medium">Вопрос: {mistake.question}</AlertTitle>
                        <AlertDescription className="text-sm mt-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="font-medium">Ваш ответ:</div>
                              <div className="text-muted-foreground">{mistake.user_answer || 'Нет ответа'}</div>
                            </div>
                            <div>
                              <div className="font-medium">Правильный ответ:</div>
                              <div>{mistake.correct_answer}</div>
                            </div>
                          </div>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium mb-2">Рекомендации:</h4>
            <p className="text-sm text-muted-foreground">
              {status === "passed" 
                ? "Отличный результат! Продолжайте в том же духе."
                : status === "warning"
                ? "Рекомендуется повторно пройти тест в ближайшее время для улучшения показателей."
                : "Необходимо пройти повторный тест с целью улучшения результатов. Обратите внимание на допущенные ошибки."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
          {onRetry && (
            <Button onClick={onRetry}>
              Пройти повторно
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
