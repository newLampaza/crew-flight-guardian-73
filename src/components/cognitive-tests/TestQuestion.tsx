
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestQuestion as TestQuestionType } from '@/types/cognitivetests';
import { TestDifference } from './test-types/TestDifference';
import { TestImages } from './test-types/TestImages';
import { TestMatrix } from './test-types/TestMatrix';
import { TestSelect } from './test-types/TestSelect';
import { TestQuestionProps } from './test-types/utils';

interface Props extends TestQuestionProps {
  question: TestQuestionType;
}

const TestQuestionComponent: React.FC<Props> = ({ question, onAnswer, disabled }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (question.delay) {
      setShowAnswer(false);
      setTimeLeft(question.delay);

      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(timer);
            setShowAnswer(true);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [question]);

  const handleSubmit = () => {
    if (question.multiple_select) {
      onAnswer(question.id, selectedOptions.join(','));
    } else {
      onAnswer(question.id, selectedOption);
    }
  };

  const renderQuestionContent = () => {
    if (!showAnswer) {
      return (
        <div className="text-center py-8">
          <p className="text-2xl font-bold">Запоминайте...</p>
          {timeLeft !== null && (
            <p className="text-lg">Осталось {timeLeft} секунд</p>
          )}
        </div>
      );
    }

    switch (question.type) {
      case 'difference':
        return <TestDifference question={question} onAnswer={onAnswer} disabled={disabled} />;
      case 'images':
        return <TestImages question={question} onAnswer={onAnswer} disabled={disabled} />;
      case 'matrix':
        return <TestMatrix question={question} onAnswer={onAnswer} disabled={disabled} />;
      case 'select':
        return <TestSelect question={question} onAnswer={onAnswer} disabled={disabled} />;
      default:
        return <div>Неизвестный тип вопроса</div>;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">{question.question}</h2>
        
        {renderQuestionContent()}
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={
              disabled ||
              (question.multiple_select && selectedOptions.length === 0) || 
              (!question.multiple_select && !selectedOption)
            }
          >
            Ответить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestQuestionComponent;
