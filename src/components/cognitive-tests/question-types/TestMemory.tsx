
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { TestQuestion } from '@/types/cognitivetests';

const QUESTION_EMOJIS = {
  fruits: ['🍎', '🍌', '🍊', '🍇', '🍉', '🍐'],
  animals: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻'],
  vehicles: ['🚗', '🚲', '✈️', '🚂', '🚢', '🚌'],
  objects: ['📱', '💻', '⌚️', '📷', '🎮', '📺'],
  buildings: ['🏠', '🏢', '🏫', '🏭', '🏰', '⛪️'],
  nature: ['🌳', '🌺', '🌙', '⭐️', '☀️', '🌈']
};

const getRandomEmojis = (category: keyof typeof QUESTION_EMOJIS, count: number) => {
  const emojis = [...QUESTION_EMOJIS[category]];
  const result = [];
  while (result.length < count && emojis.length > 0) {
    const index = Math.floor(Math.random() * emojis.length);
    result.push(emojis.splice(index, 1)[0]);
  }
  return result;
};

interface TestMemoryProps {
  onAnswer: (questionId: string, answer: string) => void;
  question: TestQuestion;
  showAnswer: boolean;
  disabled?: boolean;
}

export const TestMemory: React.FC<TestMemoryProps> = ({
  onAnswer,
  question,
  showAnswer,
  disabled
}) => {
  const [selectedOption, setSelectedOption] = useState('');

  useEffect(() => {
    setSelectedOption('');
  }, [question.id]);

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
