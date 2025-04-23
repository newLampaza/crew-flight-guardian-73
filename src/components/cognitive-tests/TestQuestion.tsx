
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TestQuestion } from '@/types/cognitivetests';
import { TestReaction } from './question-types/TestReaction';
import { TestMemory } from './question-types/TestMemory';
import { TestPairs } from './question-types/TestPairs';
import { TestMultiple } from './question-types/TestMultiple';
import { TestSingle } from './question-types/TestSingle';

interface TestQuestionProps {
  question: TestQuestion;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
}

const TestQuestionComponent: React.FC<TestQuestionProps> = ({
  question,
  onAnswer,
  disabled
}) => {
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
  }, [question.delay]);

  const renderQuestion = () => {
    if (timeLeft !== null) {
      return (
        <div className="text-center py-8">
          <p className="text-2xl font-bold mb-2">Запоминайте...</p>
          <p className="text-lg">Осталось {timeLeft} секунд</p>
        </div>
      );
    }

    switch (question.type) {
      case 'reaction':
        return (
          <TestReaction
            question={question}
            onAnswer={onAnswer}
            disabled={disabled}
          />
        );
      
      case 'memory':
        return (
          <TestMemory
            question={question}
            onAnswer={onAnswer}
            showAnswer={showAnswer}
            disabled={disabled}
          />
        );
      
      case 'pairs':
        return (
          <TestPairs
            question={question}
            onAnswer={onAnswer}
            disabled={disabled}
          />
        );
      
      case 'multiple':
        return (
          <TestMultiple
            question={question}
            onAnswer={onAnswer}
            disabled={disabled}
          />
        );
      
      default:
        return (
          <TestSingle
            question={question}
            onAnswer={onAnswer}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">{question.question}</h2>
        {renderQuestion()}
      </CardContent>
    </Card>
  );
};

export default TestQuestionComponent;
