
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TestQuestion } from '@/types/cognitivetests';

interface TestQuestionProps {
  question: TestQuestion;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
}

// Список реальных фотографий с Unsplash (можно дополнить по необходимости)
const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&auto=format&fit=crop&q=60",
];

const yandexFallbackUrl = "https://yastatic.net/s3/home/pages-blocks/illustrations/search/ru/search-image-1.png";

// Возвращает настоящую фотографию из Unsplash, если источник picsum или невалидный
const getSafeImageUrl = (imgUrl: string) => {
  // Любая ссылка со словом picsum или незаполненная или невалидная
  if (!imgUrl || imgUrl.includes('picsum.photos')) {
    // Случайная фотография из массива реальных
    const rand = Math.floor(Math.random() * UNSPLASH_IMAGES.length);
    return UNSPLASH_IMAGES[rand];
  }
  // если урл выглядит валидным — отдаём его как есть
  return imgUrl;
};

const TestQuestionComponent: React.FC<TestQuestionProps> = ({ question, onAnswer, disabled }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [imageFallbacks, setImageFallbacks] = useState<Record<string, boolean>>({});

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
      onAnswer(question.id, selectedOptions.join(','));
    } else {
      onAnswer(question.id, selectedOption);
    }
  };

  const handleImageError = (img: string) => {
    console.error(`Ошибка загрузки изображения: ${img}`);
    setImageFallbacks(prev => ({
      ...prev,
      [img]: true
    }));
  };

  // Если была ошибка загрузки — показываем yandexFallbackUrl, иначе реальное фото из getSafeImageUrl
  const getImageSource = (img: string) => {
    if (imageFallbacks[img]) {
      return yandexFallbackUrl;
    }
    return getSafeImageUrl(img);
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'difference':
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

      case 'count':
      case 'pattern':
      case 'logic':
      case 'math':
        return (
          <div className="space-y-4">
            {question.image && (
              <div className="mb-4">
                <img 
                  src={getImageSource(question.image)} 
                  alt="Вопрос" 
                  className="max-w-full h-auto mx-auto"
                  onError={() => handleImageError(question.image || '')}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
          </div>
        );

      case 'select':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {question.options?.map((option, index) => (
                <div className="flex items-center space-x-2" key={index}>
                  <Checkbox 
                    id={`option-${index}`}
                    checked={selectedOptions.includes(option)}
                    onCheckedChange={() => handleMultipleSelect(option)}
                  />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'sequence':
        return (
          <div className="text-center py-8">
            {showAnswer ? (
              <input
                type="text"
                placeholder="Введите последовательность"
                className="border-2 border-gray-300 p-2 rounded-md w-full max-w-xs"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              />
            ) : (
              <p className="text-2xl font-bold">Запоминайте...</p>
            )}
          </div>
        );
        
      case 'words':
        return (
          <div className="space-y-4">
            {showAnswer ? (
              <div className="grid grid-cols-2 gap-2">
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
            ) : (
              <p className="text-2xl font-bold">Запоминайте...</p>
            )}
          </div>
        );
        
      case 'images':
        return (
          <div className="space-y-4">
            {showAnswer ? (
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
            ) : (
              <p className="text-2xl font-bold">Запоминайте...</p>
            )}
          </div>
        );
        
      case 'pairs':
        return (
          <div className="space-y-4">
            {showAnswer ? (
              <div className="grid grid-cols-2 gap-2">
                {question.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                    <select
                      id={`option-${index}`}
                      className="border-2 border-gray-300 p-2 rounded-md"
                      value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    >
                      <option value="">Выберите...</option>
                      {question.answer_options?.map((answer, i) => (
                        <option key={i} value={answer}>{answer}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-2xl font-bold">Запоминайте...</p>
            )}
          </div>
        );
        
      case 'matrix':
        return (
          <div className="space-y-4">
            {showAnswer ? (
              <>
                {question.question_text && (
                  <p className="text-lg">{question.question_text}</p>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {question.matrix?.map((row, rowIndex) => (
                    row.map((cell, cellIndex) => (
                      <div
                        key={`${rowIndex}-${cellIndex}`}
                        className="border-2 border-gray-300 p-2 text-center"
                      >
                        {cell}
                      </div>
                    ))
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
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
              </>
            ) : (
              <p className="text-2xl font-bold">Запоминайте...</p>
            )}
          </div>
        );
      
      default:
        return <div>Неизвестный тип вопроса</div>;
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TestQuestionComponent;

