
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

const TestQuestionComponent: React.FC<TestQuestionProps> = ({ question, onAnswer, disabled }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // Обработка вопросов с задержкой (для вопросов на запоминание)
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
  
  // Функция для обработки выбора опции в вопросах с множественным выбором
  const handleMultipleSelect = (option: string) => {
    setSelectedOptions(prev => {
      // Если опция уже выбрана, удаляем ее
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      }
      // Иначе добавляем
      return [...prev, option];
    });
  };
  
  // Отправка ответа
  const handleSubmit = () => {
    if (question.multiple_select) {
      // Для вопросов с множественным выбором соединяем ответы через запятую
      onAnswer(question.id, selectedOptions.join(','));
    } else {
      // Для вопросов с одиночным выбором
      onAnswer(question.id, selectedOption);
    }
  };
  
  // Отображение разных типов вопросов
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
                  src={img} 
                  alt={`Изображение ${index + 1}`} 
                  className="w-full h-auto"
                  onError={(e) => {
                    console.error(`Ошибка загрузки изображения: ${img}`);
                    e.currentTarget.src = "https://picsum.photos/300/200"; // Запасное изображение
                  }}
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
                  src={question.image} 
                  alt="Вопрос" 
                  className="max-w-full h-auto mx-auto"
                  onError={(e) => {
                    console.error(`Ошибка загрузки изображения: ${question.image}`);
                    e.currentTarget.src = "https://picsum.photos/300/200"; // Запасное изображение
                  }}
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
        // Вопрос с множественным выбором
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
                      src={img} 
                      alt={`Изображение ${index + 1}`} 
                      className="w-full h-auto"
                      onError={(e) => {
                        console.error(`Ошибка загрузки изображения: ${img}`);
                        e.currentTarget.src = "https://picsum.photos/300/200"; // Запасное изображение
                      }}
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

export default TestQuestionComponent; // Changed to use default export
