
import React, { useState } from 'react';
import { TestQuestionProps, getSafeImageUrl, yandexFallbackUrl } from './utils';

export const TestImages: React.FC<TestQuestionProps> = ({ question, onAnswer, disabled }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [imageFallbacks, setImageFallbacks] = useState<Record<string, boolean>>({});

  const handleImageError = (img: string) => {
    console.error(`Ошибка загрузки изображения: ${img}`);
    setImageFallbacks(prev => ({
      ...prev,
      [img]: true
    }));
  };

  const getImageSource = (img: string) => {
    if (imageFallbacks[img]) {
      return yandexFallbackUrl;
    }
    return getSafeImageUrl(img);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {question.options?.map((img, index) => (
        <div 
          key={index} 
          className={`border-2 p-1 cursor-pointer ${selectedOption === img ? 'border-primary' : 'border-gray-200'}`}
          onClick={() => setSelectedOption(img)}
        >
          <img 
            src={getImageSource(img)} 
            alt={`Изображение ${index + 1}`} 
            className="w-full h-auto"
            onError={() => handleImageError(img)}
          />
        </div>
      ))}
    </div>
  );
};
