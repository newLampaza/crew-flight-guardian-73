
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TestResults } from "./TestResults";
import { TestResult } from "@/types/cognitivetests";

interface ResultsDialogProps {
  isOpen: boolean;
  testResults: TestResult | null;
  onClose: () => void;
  onRetry?: () => void;
}

export const ResultsDialog: React.FC<ResultsDialogProps> = ({
  isOpen,
  testResults,
  onClose,
  onRetry
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            onClose={onClose}
            onRetry={onRetry}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
