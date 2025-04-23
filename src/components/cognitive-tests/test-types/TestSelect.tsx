
import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TestQuestionProps } from './utils';

export const TestSelect: React.FC<TestQuestionProps> = ({ question, onAnswer, disabled }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

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
      <div className="grid grid-cols-1 gap-2">
        {question.options?.map((option, index) => (
          <div className="flex items-center space-x-2" key={index}>
            <Checkbox 
              id={`option-${index}`}
              checked={selectedOptions.includes(option)}
              onCheckedChange={() => handleMultipleSelect(option)}
            />
            <Label htmlFor={`option-${index}`}>{option}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};
