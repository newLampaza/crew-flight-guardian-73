
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TestQuestion } from '@/types/cognitivetests';
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface TestQuestionProps {
  question: TestQuestion;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
}

// Эмодзи для вопросов с изображениями
const QUESTION_EMOJIS = {
  fruits: ['🍎', '🍌', '🍊', '🍇', '🍉', '🍐'],
  animals: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻'],
  vehicles: ['🚗', '🚲', '✈️', '🚂', '🚢', '🚌'],
  objects: ['📱', '💻', '⌚️', '📷', '🎮', '📺'],
  buildings: ['🏠', '🏢', '🏫', '🏭', '🏰', '⛪️'],
  nature: ['🌳', '🌺', '🌙', '⭐️', '☀️', '🌈']
};

// Функция для получения случайных эмодзи из категории
const getRandomEmojis = (category: keyof typeof QUESTION_EMOJIS, count: number) => {
  const emojis = [...QUESTION_EMOJIS[category]];
  const result = [];
  while (result.length < count && emojis.length > 0) {
    const index = Math.floor(Math.random() * emojis.length);
    result.push(emojis.splice(index, 1)[0]);
  }
  return result;
};

const TestQuestionComponent: React.FC<TestQuestionProps> = ({ question, onAnswer, disabled }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [showReactionTarget, setShowReactionTarget] = useState(false);

  // Очищаем состояния при смене вопроса
  useEffect(() => {
    setSelectedOption('');
    setSelectedOptions([]);
    setReactionStartTime(null);
    setShowReactionTarget(false);

    if (question.type === 'reaction') {
      // Случайная задержка для теста реакции (1-3 секунды)
      const delay = Math.random() * 2000 + 1000;
      setTimeout(() => {
        setShowReactionTarget(true);
        setReactionStartTime(Date.now());
      }, delay);
    }
  }, [question.id]);

  // Обработка временного лимита
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

  const handleReactionClick = () => {
    if (reactionStartTime && showReactionTarget) {
      const reactionTime = Date.now() - reactionStartTime;
      onAnswer(question.id, reactionTime.toString());
      setShowReactionTarget(false);
    }
  };

  const handleMultipleSelect = (option: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      }
      return [...prev, option];
    });
  };

  const handleSubmit = () => {
    if (question.multiple_select) {
      const sortedOptions = [...selectedOptions].sort();
      onAnswer(question.id, sortedOptions.join(','));
    } else {
      onAnswer(question.id, selectedOption);
    }
  };

  const renderReactionTest = () => (
    <div className="flex justify-center items-center h-64">
      {showReactionTarget ? (
        <button
          onClick={handleReactionClick}
          className="w-24 h-24 rounded-full bg-green-500 hover:bg-green-600 transition-colors focus:outline-none"
          aria-label="Нажмите как можно быстрее"
        />
      ) : (
        <p className="text-lg text-center">
          Приготовьтесь! Когда появится зеленый круг, нажмите на него как можно быстрее
        </p>
      )}
    </div>
  );

  const renderMemoryTest = () => {
    if (!showAnswer) {
      return (
        <div className="grid grid-cols-3 gap-4 p-4">
          {getRandomEmojis(
            question.category as keyof typeof QUESTION_EMOJIS || 'objects',
            6
          ).map((emoji, index) => (
            <div
              key={index}
              className="text-4xl flex justify-center items-center p-4 border rounded"
            >
              {emoji}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {question.options?.map((option, index) => (
          <Button
            key={index}
            variant={selectedOption === option ? "default" : "outline"}
            className="h-16 text-2xl"
            onClick={() => setSelectedOption(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    );
  };

  const renderPairsMatching = () => (
    <div className="space-y-4">
      {question.options?.map((option, index) => (
        <div key={index} className="flex items-center space-x-4">
          <span className="text-2xl">{option}</span>
          <select
            className="flex-1 p-2 border rounded"
            value={selectedOption.split(',')[index] || ''}
            onChange={(e) => {
              const answers = selectedOption.split(',');
              answers[index] = e.target.value;
              setSelectedOption(answers.join(','));
            }}
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
    </div>
  );

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'reaction':
        return renderReactionTest();
      
      case 'memory':
        return renderMemoryTest();
      
      case 'pairs':
        return renderPairsMatching();
      
      case 'multiple':
        return (
          <div className="space-y-4">
            {question.options?.map((option, index) => (
              <div className="flex items-center space-x-2" key={index}>
                <Checkbox
                  id={`option-${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={() => handleMultipleSelect(option)}
                />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className="grid grid-cols-2 gap-4">
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
        );
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">{question.question}</h2>
        
        {timeLeft !== null ? (
          <div className="text-center py-8">
            <p className="text-2xl font-bold mb-2">Запоминайте...</p>
            <p className="text-lg">Осталось {timeLeft} секунд</p>
          </div>
        ) : (
          <>
            {renderQuestionContent()}
            
            {!question.type.includes('reaction') && (
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
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TestQuestionComponent;
