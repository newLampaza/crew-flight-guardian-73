
import React, { useEffect, useState } from 'react';
import { TestQuestion } from '@/types/cognitivetests';

interface TestReactionProps {
  onAnswer: (questionId: string, answer: string) => void;
  question: TestQuestion;
  disabled?: boolean;
}

export const TestReaction: React.FC<TestReactionProps> = ({
  onAnswer,
  question,
  disabled
}) => {
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [showReactionTarget, setShowReactionTarget] = useState(false);

  useEffect(() => {
    setReactionStartTime(null);
    setShowReactionTarget(false);
    
    const delay = Math.random() * 2000 + 1000;
    setTimeout(() => {
      setShowReactionTarget(true);
      setReactionStartTime(Date.now());
    }, delay);
  }, [question.id]);

  const handleReactionClick = () => {
    if (reactionStartTime && showReactionTarget) {
      const reactionTime = Date.now() - reactionStartTime;
      onAnswer(question.id, reactionTime.toString());
      setShowReactionTarget(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-64">
      {showReactionTarget ? (
        <button
          onClick={handleReactionClick}
          className="w-24 h-24 rounded-full bg-green-500 hover:bg-green-600 transition-colors focus:outline-none"
          aria-label="Нажмите как можно быстрее"
          disabled={disabled}
        />
      ) : (
        <p className="text-lg text-center">
          Приготовьтесь! Когда появится зеленый круг, нажмите на него как можно быстрее
        </p>
      )}
    </div>
  );
};
