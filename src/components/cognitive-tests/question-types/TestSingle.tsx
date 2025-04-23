
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { TestQuestion } from '@/types/cognitivetests';

interface TestSingleProps {
  onAnswer: (questionId: string, answer: string) => void;
  question: TestQuestion;
  disabled?: boolean;
}

export const TestSingle: React.FC<TestSingleProps> = ({
  onAnswer,
  question,
  disabled
}) => {
  const [selectedOption, setSelectedOption] = useState('');

  useEffect(() => {
    setSelectedOption('');
  }, [question.id]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {question.options?.map((option, index) => (
        <Button
          key={index}
          variant={selectedOption === option ? "default" : "outline"}
          className="justify-start h-auto py-2"
          onClick={() => {
            setSelectedOption(option);
            onAnswer(question.id, option);
          }}
          disabled={disabled}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};
