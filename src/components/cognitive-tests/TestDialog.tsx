
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestProgress } from "./TestProgress";
import { TestQuestion } from "./TestQuestion";
import { TestResults } from "./TestResults";
import { TestResult, TestQuestion as TestQuestionType } from "@/types/cognitivetests";

interface TestDialogProps {
  isOpen: boolean;
  testConfig: {
    id: string;
    name: string;
    description: string;
  } | undefined;
  testInProgress: boolean;
  testComplete: boolean;
  currentTestSession: {
    timeLimit: number;
    questions: TestQuestionType[];
    currentQuestion: number;
  } | null;
  testResults: TestResult | null;
  isLoading: boolean;
  onClose: () => void;
  onStart: () => void;
  onAnswer: (questionId: string, answer: string) => void;
  onTimeUp: () => void;
}

export const TestDialog: React.FC<TestDialogProps> = ({
  isOpen,
  testConfig,
  testInProgress,
  testComplete,
  currentTestSession,
  testResults,
  isLoading,
  onClose,
  onStart,
  onAnswer,
  onTimeUp
}) => {
  const currentQuestion = currentTestSession 
    ? currentTestSession.questions[currentTestSession.currentQuestion]
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{testConfig?.name}</DialogTitle>
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
                onTimeUp={onTimeUp}
              />
              
              {currentQuestion && (
                <TestQuestion
                  question={currentQuestion}
                  onAnswer={onAnswer}
                  disabled={isLoading}
                />
              )}
            </div>
          )}
          
          {testComplete && testResults && (
            <TestResults
              result={testResults}
              onClose={onClose}
            />
          )}
          
          {!testInProgress && !testComplete && (
            <Card>
              <CardHeader>
                <CardTitle>О тесте</CardTitle>
                <CardDescription>{testConfig?.description}</CardDescription>
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
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Отмена
              </Button>
              <Button onClick={onStart} disabled={isLoading}>
                {isLoading ? "Загрузка..." : "Начать тест"}
              </Button>
            </>
          )}
          
          {testInProgress && (
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Отменить тест
            </Button>
          )}
          
          {testComplete && !testResults && (
            <Button onClick={onClose} disabled={isLoading}>
              Закрыть
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
