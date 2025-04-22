
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { TestQuestion as TestQuestionType } from '@/types/cognitivetests';

interface TestQuestionProps {
  question: TestQuestionType;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
}

export const TestQuestion: React.FC<TestQuestionProps> = ({
  question,
  onAnswer,
  disabled = false
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showQuestion, setShowQuestion] = useState(question.type !== 'sequence');
  const [sequenceView, setSequenceView] = useState<'show' | 'hide' | 'answer'>(
    question.type === 'sequence' ? 'show' : 'hide'
  );
  const [inputValue, setInputValue] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (question.type === 'sequence') {
      const timer = setTimeout(() => {
        setSequenceView('hide');
        setTimeout(() => {
          setSequenceView('answer');
          setShowQuestion(true);
        }, 1000);
      }, (question.delay || 5) * 1000);
      
      return () => clearTimeout(timer);
    }
    
    if (question.type === 'quick_choice') {
      const timer = setTimeout(() => {
        setShowQuestion(true);
        setStartTime(Date.now());
      }, (question.delay || 1) * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [question]);

  const handleSelectOption = (option: string) => {
    if (disabled) return;
    
    setSelectedAnswer(option);
    onAnswer(question.id, option);
  };

  const handleQuickChoice = () => {
    if (disabled) return;
    
    const reactionTime = startTime ? Date.now() - startTime : 0;
    onAnswer(question.id, `click:${reactionTime}`);
    setShowQuestion(false);
  };

  const handleSequenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    onAnswer(question.id, inputValue);
    setInputValue('');
  };

  if (!showQuestion) {
    if (question.type === 'quick_choice') {
      return (
        <div className="flex items-center justify-center h-64 bg-muted rounded-md">
          <p className="text-center text-muted-foreground">Ждите...</p>
        </div>
      );
    }
    
    if (question.type === 'sequence' && sequenceView === 'show') {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-md p-6">
          <p className="text-center mb-4">{question.question}</p>
          <div className="text-3xl font-bold">{question.correct_answer}</div>
          <p className="text-sm mt-4 text-muted-foreground">Запоминайте...</p>
        </div>
      );
    }
    
    if (question.type === 'sequence' && sequenceView === 'hide') {
      return (
        <div className="flex items-center justify-center h-64 bg-muted rounded-md">
          <p className="text-center text-muted-foreground">Запомнили?</p>
        </div>
      );
    }
  }

  return (
    <div className="bg-card p-6 rounded-md shadow-sm">
      {question.type === 'image' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Найдите отличия:</h3>
            <div className="flex justify-center mb-4">
              <img src={question.question} alt="Найдите отличия" className="max-h-64 border rounded" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {question.options?.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === option ? "default" : "outline"}
                className="h-auto py-2 flex flex-col items-center"
                onClick={() => handleSelectOption(option)}
                disabled={disabled}
              >
                <img src={option} alt={`Вариант ${index + 1}`} className="max-h-32 mb-2" />
                <span>Вариант {index + 1}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {question.type === 'sequence' && sequenceView === 'answer' && (
        <form onSubmit={handleSequenceSubmit} className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Введите последовательность, которую вы запомнили:</h3>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Введите ответ..."
              disabled={disabled}
              autoFocus
            />
          </div>
          
          <Button type="submit" disabled={disabled || !inputValue}>
            Отправить
          </Button>
        </form>
      )}
      
      {question.type === 'quick_choice' && (
        <div className="space-y-4 text-center">
          <h3 className="text-lg font-medium">{question.question}</h3>
          
          <div className="h-32 flex items-center justify-center">
            <Button
              size="lg"
              className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600"
              onClick={handleQuickChoice}
              disabled={disabled}
            >
              Клик!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
