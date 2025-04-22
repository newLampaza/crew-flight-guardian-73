
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TestQuestion as TestQuestionType } from "@/types/cognitivetests";

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
  const [answer, setAnswer] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showStimulus, setShowStimulus] = useState(false);
  const [currentStimulus, setCurrentStimulus] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    // Сбрасываем состояние при смене вопроса
    setAnswer('');
    setSelectedItems([]);
    setShowOptions(true);
    setShowStimulus(false);
    setCurrentStimulus(null);
    setStartTime(null);
    
    // Обрабатываем задержку, если она указана
    if (question.delay && question.delay > 0) {
      if (question.type === 'sequence' || question.type === 'words' || 
          question.type === 'images' || question.type === 'pairs' || 
          question.type === 'matrix' || question.type === 'grid') {
        // Вопросы на память: показываем, затем скрываем
        setShowOptions(true);
        setCountdown(Math.round(question.delay));
        
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(timer);
              setShowOptions(false);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      } 
      else if (question.type.includes('reaction') || question.type === 'quick_choice' || 
               question.type === 'go_nogo' || question.type === 'choice_reaction' || 
               question.type === 'reaction_chain' || question.type === 'multi_target') {
        // Вопросы на реакцию: скрываем, затем показываем
        setShowOptions(false);
        
        const delayMs = question.delay * 1000;
        const randomDelay = delayMs + Math.random() * 500; // Добавляем случайность
        
        const timer = setTimeout(() => {
          setShowStimulus(true);
          setStartTime(Date.now());
          
          if (Array.isArray(question.stimulus)) {
            setCurrentStimulus(question.stimulus[Math.floor(Math.random() * question.stimulus.length)]);
          } else {
            setCurrentStimulus(question.stimulus as string);
          }
        }, randomDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [question]);

  const handleSingleOptionSelect = (value: string) => {
    setAnswer(value);
  };

  const handleMultipleOptionSelect = (value: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleReactionClick = () => {
    if (!startTime) return;
    
    const reactionTime = Date.now() - startTime;
    const answerValue = `click:${reactionTime}`;
    onAnswer(question.id, answerValue);
  };

  const handleChoiceReaction = (choice: string) => {
    if (!startTime || !currentStimulus) return;
    
    const reactionTime = Date.now() - startTime;
    const answerValue = `${currentStimulus}:${choice}:${reactionTime}`;
    onAnswer(question.id, answerValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
  };

  const handleSubmitAnswer = () => {
    if (question.type === 'select' || question.type === 'words' || 
        question.type === 'images' || question.type === 'pairs' || 
        question.type === 'multi_target') {
      onAnswer(question.id, selectedItems.join(','));
    } else {
      onAnswer(question.id, answer);
    }
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'difference':
      case 'select':
      case 'pattern':
      case 'math':
      case 'verbal':
      case 'logic':
      case 'count':
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            
            {question.image && (
              <div className="flex justify-center my-4">
                <img src={question.image} alt="Вопрос" className="max-w-full max-h-64" />
              </div>
            )}
            
            <RadioGroup value={answer} onValueChange={handleSingleOptionSelect}>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} disabled={disabled} />
                  <Label htmlFor={`option-${index}`}>
                    {option.startsWith('http') ? 
                      <img src={option} alt={`Вариант ${index+1}`} className="max-w-36 max-h-36" /> : 
                      option
                    }
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
        
      case 'words':
      case 'images':
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            
            {showOptions ? (
              <div className="p-4 border rounded-md bg-accent">
                {countdown !== null && <div className="text-right text-sm">Осталось секунд: {countdown}</div>}
                <div className="flex flex-wrap gap-2 justify-center my-4">
                  {question.type === 'words' ? 
                    question.question.split(': ')[1].split(', ').map((word, i) => (
                      <div key={i} className="p-2 border rounded bg-background">{word}</div>
                    )) :
                    question.images?.map((img, i) => (
                      <div key={i} className="p-2 border rounded bg-background text-2xl">{img}</div>
                    ))
                  }
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-medium">Выберите все элементы, которые были показаны:</p>
                {question.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`check-${index}`} 
                      checked={selectedItems.includes(option)}
                      onCheckedChange={() => handleMultipleOptionSelect(option)}
                      disabled={disabled}
                    />
                    <label htmlFor={`check-${index}`} className="text-sm font-medium">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'sequence':
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            
            {!showOptions && (
              <div className="space-y-2">
                <p className="font-medium">Введите последовательность, которую вы запомнили:</p>
                <Input 
                  type="text" 
                  placeholder="Введите ответ"
                  value={answer}
                  onChange={handleInputChange}
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        );
        
      case 'quick_choice':
      case 'go_nogo':
        return (
          <div className="space-y-4 text-center">
            <CardDescription>{question.question}</CardDescription>
            
            {showStimulus && (
              <div 
                className="flex items-center justify-center h-32 cursor-pointer"
                onClick={handleReactionClick}
              >
                {currentStimulus === 'red_circle' && (
                  <div className="w-20 h-20 bg-red-500 rounded-full"></div>
                )}
                {currentStimulus === 'green_circle' && (
                  <div className="w-20 h-20 bg-green-500 rounded-full"></div>
                )}
                {currentStimulus === 'X' && (
                  <div className="text-5xl font-bold">X</div>
                )}
                {currentStimulus === 'Y' && (
                  <div className="text-5xl font-bold">Y</div>
                )}
                {(currentStimulus === '1' || currentStimulus === '2' || currentStimulus === '3') && (
                  <div className="text-5xl font-bold">{currentStimulus}</div>
                )}
                {currentStimulus === 'red_square' && (
                  <div className="w-20 h-20 bg-red-500"></div>
                )}
                {currentStimulus === 'red_triangle' && (
                  <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[70px] border-transparent border-b-red-500"></div>
                )}
                {currentStimulus === 'blue_square' && (
                  <div className="w-20 h-20 bg-blue-500"></div>
                )}
              </div>
            )}
            
            {!showStimulus && !showOptions && (
              <div className="p-4 border rounded">
                <p>Ожидание... будьте готовы нажать при появлении стимула</p>
              </div>
            )}
          </div>
        );
        
      case 'choice_reaction':
        return (
          <div className="space-y-4 text-center">
            <CardDescription>{question.question}</CardDescription>
            
            {showStimulus && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center justify-center h-32">
                  {currentStimulus === 'red_circle' && (
                    <div className="w-20 h-20 bg-red-500 rounded-full"></div>
                  )}
                  {currentStimulus === 'green_circle' && (
                    <div className="w-20 h-20 bg-green-500 rounded-full"></div>
                  )}
                </div>
                
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => handleChoiceReaction('left')}
                    variant="outline"
                    disabled={disabled}
                  >
                    Левая
                  </Button>
                  <Button 
                    onClick={() => handleChoiceReaction('right')}
                    variant="outline"
                    disabled={disabled}
                  >
                    Правая
                  </Button>
                </div>
              </div>
            )}
            
            {!showStimulus && (
              <div className="p-4 border rounded">
                <p>Ожидание... будьте готовы выбрать правильную кнопку</p>
              </div>
            )}
          </div>
        );
        
      case 'pairs':
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            
            {showOptions ? (
              <div className="p-4 border rounded-md bg-accent">
                {countdown !== null && <div className="text-right text-sm">Осталось секунд: {countdown}</div>}
                <div className="grid grid-cols-2 gap-2 my-4">
                  {question.question.split(': ')[1].split(', ').map((pair, i) => (
                    <div key={i} className="p-2 border rounded bg-background text-center">{pair}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-medium">Укажите пары для каждой буквы:</p>
                {question.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1/4">{option}</div>
                    <RadioGroup 
                      value={selectedItems[index]?.split('-')[1] || ''}
                      onValueChange={(val) => {
                        const letter = option.split('-')[0];
                        setSelectedItems(prev => {
                          const newItems = [...prev];
                          newItems[index] = `${letter}-${val}`;
                          return newItems;
                        });
                      }}
                      className="flex space-x-2"
                    >
                      {question.answer_options?.map((ans, i) => (
                        <div key={i} className="flex items-center space-x-1">
                          <RadioGroupItem value={ans} id={`ans-${index}-${i}`} disabled={disabled} />
                          <Label htmlFor={`ans-${index}-${i}`}>{ans}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'grid':
      case 'matrix':
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            
            {showOptions ? (
              <div className="p-4 border rounded-md bg-accent">
                {countdown !== null && <div className="text-right text-sm">Осталось секунд: {countdown}</div>}
                <div className="flex justify-center my-4">
                  <div className="grid grid-cols-3 gap-1">
                    {question.type === 'grid' 
                      ? question.grid?.map((row, rowIndex) => (
                          row.map((cell, colIndex) => (
                            <div key={`${rowIndex}-${colIndex}`} className="w-12 h-12 flex items-center justify-center border bg-background text-lg">
                              {cell}
                            </div>
                          ))
                        ))
                      : question.matrix?.map((row, rowIndex) => (
                          row.map((cell, colIndex) => (
                            <div key={`${rowIndex}-${colIndex}`} className="w-12 h-12 flex items-center justify-center border bg-background text-lg">
                              {cell}
                            </div>
                          ))
                        ))
                    }
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-medium">{question.question_text}</p>
                <RadioGroup value={answer} onValueChange={handleSingleOptionSelect}>
                  <div className="grid grid-cols-3 gap-2">
                    {question.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`grid-option-${index}`} disabled={disabled} />
                        <Label htmlFor={`grid-option-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        );
        
      case 'spatial':
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            
            <div className="flex justify-center my-4">
              <img src={question.image} alt="Вопрос" className="max-w-full max-h-40" />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img src={option} alt={`Вариант ${index+1}`} className="max-w-24 max-h-24 mb-2" />
                  <RadioGroup value={answer} onValueChange={handleSingleOptionSelect} className="flex justify-center">
                    <RadioGroupItem value={option} id={`spatial-option-${index}`} disabled={disabled} />
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>
        );
    
      default:
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            {question.options && (
              <RadioGroup value={answer} onValueChange={handleSingleOptionSelect}>
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} disabled={disabled} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        );
    }
  };
  
  // Определяем, нужно ли показывать кнопку "Ответить"
  const showSubmitButton = () => {
    // Для реакционных тестов кнопка не нужна
    if (question.type.includes('reaction') || 
        question.type === 'quick_choice' || 
        question.type === 'go_nogo' || 
        question.type === 'choice_reaction') {
      return false;
    }
    
    // Для тестов на память не показываем кнопку во время отображения элементов
    if ((question.type === 'sequence' || 
         question.type === 'words' || 
         question.type === 'images' || 
         question.type === 'pairs' || 
         question.type === 'matrix' || 
         question.type === 'grid') && showOptions) {
      return false;
    }
    
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Вопрос {question.type === 'sequence' && showOptions ? '(запомните)' : ''}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderQuestionContent()}
        
        {showSubmitButton() && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSubmitAnswer} disabled={disabled}>
              Ответить
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
