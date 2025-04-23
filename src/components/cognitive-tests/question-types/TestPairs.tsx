
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { TestQuestion } from '@/types/cognitivetests';

interface TestPairsProps {
  onAnswer: (questionId: string, answer: string) => void;
  question: TestQuestion;
  disabled?: boolean;
}

export const TestPairs: React.FC<TestPairsProps> = ({
  onAnswer,
  question,
  disabled
}) => {
  const [selectedOption, setSelectedOption] = useState('');

  useEffect(() => {
    setSelectedOption('');
  }, [question.id]);

  const handleChange = (index: number, value: string) => {
    const answers = selectedOption.split(',');
    answers[index] = value;
    const newSelectedOption = answers.join(',');
    setSelectedOption(newSelectedOption);
  };

  return (
    <div className="space-y-4">
      {question.options?.map((option, index) => (
        <div key={index} className="flex items-center space-x-4">
          <span className="text-2xl">{option}</span>
          <select
            className="flex-1 p-2 border rounded"
            value={selectedOption.split(',')[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            disabled={disabled}
          >
            <option value="">Выберите соответствие</option>
            {question.answer_options?.map((answer, i) => (
              <option key={i} value={answer}>
                {answer}
              </option>
            ))}
          </select>
        </div>
      ))}
      <div className="flex justify-end mt-4">
        <Button 
          onClick={() => onAnswer(question.id, selectedOption)}
          disabled={disabled || !selectedOption || selectedOption.split(',').some(v => !v)}
        >
          Ответить
        </Button>
      </div>
    </div>
  );
};
