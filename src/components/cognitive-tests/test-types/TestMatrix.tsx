
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { TestQuestionProps } from './utils';

export const TestMatrix: React.FC<TestQuestionProps> = ({ question, onAnswer, disabled }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');

  return (
    <div className="space-y-4">
      {question.question_text && (
        <p className="text-lg">{question.question_text}</p>
      )}
      <div className="grid grid-cols-3 gap-2">
        {question.matrix?.map((row, rowIndex) => (
          row.map((cell, cellIndex) => (
            <div
              key={`${rowIndex}-${cellIndex}`}
              className="border-2 border-gray-300 p-2 text-center"
            >
              {cell}
            </div>
          ))
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {question.options?.map((option, index) => (
          <Button
            key={index}
            variant={selectedOption === option ? "default" : "outline"}
            className="justify-start h-auto py-2"
            onClick={() => setSelectedOption(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};
