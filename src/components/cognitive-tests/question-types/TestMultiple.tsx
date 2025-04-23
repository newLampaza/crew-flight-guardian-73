
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TestQuestion } from '@/types/cognitivetests';

interface TestMultipleProps {
  onAnswer: (questionId: string, answer: string) => void;
  question: TestQuestion;
  disabled?: boolean;
}

export const TestMultiple: React.FC<TestMultipleProps> = ({
  onAnswer,
  question,
  disabled
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    setSelectedOptions([]);
  }, [question.id]);

  const handleMultipleSelect = (option: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      }
      return [...prev, option];
    });
  };

  return (
    <div className="space-y-4">
      {question.options?.map((option, index) => (
        <div className="flex items-center space-x-2" key={index}>
          <Checkbox
            id={`option-${index}`}
            checked={selectedOptions.includes(option)}
            onCheckedChange={() => handleMultipleSelect(option)}
            disabled={disabled}
          />
          <Label htmlFor={`option-${index}`} className="cursor-pointer">
            {option}
          </Label>
        </div>
      ))}
      <div className="flex justify-end mt-4">
        <Button 
          onClick={() => {
            const sortedOptions = [...selectedOptions].sort();
            onAnswer(question.id, sortedOptions.join(','));
          }}
          disabled={disabled || selectedOptions.length === 0}
        >
          Ответить
        </Button>
      </div>
    </div>
  );
};
