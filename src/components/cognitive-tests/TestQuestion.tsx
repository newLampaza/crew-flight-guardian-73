
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TestQuestionProps {
  question: {
    id: string;
    type: string;
    question: string;
    options?: string[];
  };
  onAnswer: (id: string, answer: string) => void;
}

const TestQuestion: React.FC<TestQuestionProps> = ({ question, onAnswer }) => {
  const [userAnswer, setUserAnswer] = useState<string>('');

  const handleSubmit = () => {
    onAnswer(question.id, userAnswer);
  };

  useEffect(() => {
    setUserAnswer('');
  }, [question.id]);

  const renderQuestion = () => {
    switch (question.type) {
      case 'sequence':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{question.question}</p>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Введите последовательность"
            />
          </div>
        );
      
      case 'quick_choice':
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-lg font-medium">{question.question}</p>
            <Button
              size="lg"
              className="w-32 h-32 rounded-full"
              onClick={() => onAnswer(question.id, 'click')}
            >
              Нажмите
            </Button>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{question.question}</p>
            <div className="grid grid-cols-2 gap-4">
              {question.options?.map((option, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all ${
                    userAnswer === option ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setUserAnswer(option)}
                >
                  <CardContent className="p-2">
                    <img src={option} alt={`Option ${index + 1}`} className="w-full h-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return <p>Неподдерживаемый тип вопроса</p>;
    }
  };

  return (
    <div className="space-y-6">
      {renderQuestion()}
      {question.type !== 'quick_choice' && (
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Ответить</Button>
        </div>
      )}
    </div>
  );
};

export default TestQuestion;
