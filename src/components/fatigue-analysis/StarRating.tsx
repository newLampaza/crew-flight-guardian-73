
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  currentRating: number;
  onRatingChange: (rating: number) => void;
  labels?: string[];
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  currentRating, 
  onRatingChange,
  labels = ['Очень плохо', 'Плохо', 'Удовлетворительно', 'Хорошо', 'Отлично'] 
}) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <div 
          key={star}
          className="relative cursor-pointer transition-transform hover:scale-110"
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(0)}
          onClick={() => onRatingChange(star)}
        >
          <Star
            className={`h-6 w-6 ${
              star <= (hoveredStar || currentRating) 
                ? 'text-amber-400 fill-amber-400' 
                : 'text-gray-300'
            } transition-colors duration-200`}
          />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap">
            {labels[star - 1]}
          </div>
        </div>
      ))}
    </div>
  );
};
