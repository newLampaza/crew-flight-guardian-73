
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TestQuestion } from '@/types/cognitivetests';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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

// Эмодзи для элементов
const EMOJIS: Record<string, string> = {
  "яблоко": "🍎",
  "банан": "🍌",
  "груша": "🍐",
  "апельсин": "🍊",
  "лимон": "🍋",
  "виноград": "🍇",
  "клубника": "🍓",
  "арбуз": "🍉",
  "персик": "🍑",
  "ананас": "🍍",
  "красный": "🟥",
  "синий": "🟦",
  "зеленый": "🟩",
  "желтый": "🟨",
  "фиолетовый": "🟪",
  "оранжевый": "🟧",
  "черный": "⬛",
  "белый": "⬜",
};

const TestQuestionComponent: React.FC<TestQuestionProps> = ({ question, onAnswer, disabled }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [imageFallbacks, setImageFallbacks] = useState<Record<string, boolean>>({});
  const [sequenceItems, setSequenceItems] = useState<string[]>([]);
  const [pairsSelection, setPairsSelection] = useState<Record<string, string>>({});

  useEffect(() => {
    // Сбрасываем состояние при изменении вопроса
    setSelectedOption('');
    setSelectedOptions([]);
    setShowAnswer(question.delay ? false : true);
    setImageFallbacks({});
    
    if (question.type === 'sequence' && question.options) {
      // Перемешиваем варианты для последовательности
      setSequenceItems([...question.options].sort(() => Math.random() - 0.5));
    }
    
    if (question.type === 'pairs') {
      setPairsSelection({});
    }
    
    if (question.delay) {
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

  // Обработчик для перетаскивания элементов последовательности
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sequenceItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSequenceItems(items);
  };

  // Обработчик для соотнесения пар
  const handlePairSelection = (option: string, answer: string) => {
    setPairsSelection((prev) => ({
      ...prev,
      [option]: answer
    }));
  };

  const handleSubmit = () => {
    if (question.multiple_select) {
      onAnswer(question.id, selectedOptions.join(','));
    } else if (question.type === 'sequence') {
      onAnswer(question.id, sequenceItems.join(','));
    } else if (question.type === 'pairs') {
      const pairs = Object.entries(pairsSelection).map(([option, answer]) => `${option}:${answer}`);
      onAnswer(question.id, pairs.join(','));
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

  // Получение эмодзи для текста, если таковой есть
  const getTextWithEmoji = (text: string) => {
    const emoji = EMOJIS[text.toLowerCase()];
    return emoji ? `${text} ${emoji}` : text;
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'difference':
        // Первый вопрос теста внимания (полностью изменен)
        return (
          <div className="space-y-4">
            {question.image && (
              <div className="mb-4">
                <img 
                  src={getImageSource(question.image)} 
                  alt="Основное изображение" 
                  className="max-w-full h-auto mx-auto"
                  onError={() => handleImageError(question.image || '')}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {question.options?.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedOption === option ? "default" : "outline"}
                  className="h-auto py-3 px-4 flex justify-center items-center"
                  onClick={() => setSelectedOption(option)}
                >
                  <div className="text-center">
                    {getTextWithEmoji(option)}
                  </div>
                </Button>
              ))}
            </div>
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
                  className="justify-start h-auto py-2 text-wrap whitespace-normal"
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
            
            <div className="grid grid-cols-1 gap-2">
              {question.options?.map((option, index) => (
                <div className="flex items-center space-x-2" key={index}>
                  <Checkbox 
                    id={`option-${index}`}
                    checked={selectedOptions.includes(option)}
                    onCheckedChange={() => handleMultipleSelect(option)}
                  />
                  <Label htmlFor={`option-${index}`}>{getTextWithEmoji(option)}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'sequence':
        // Должен показывать последовательность во время паузы и затем позволять её собирать
        return (
          <div className="text-center py-4">
            {!showAnswer ? (
              <div className="flex flex-col items-center justify-center">
                <p className="text-xl font-bold mb-4">Запомните последовательность:</p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {question.options?.map((item, index) => (
                    <div key={index} className="p-3 border-2 border-primary rounded-md">
                      {item}
                    </div>
                  ))}
                </div>
                <p className="text-lg">Осталось {timeLeft} секунд</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-lg mb-4">Восстановите правильную последовательность:</p>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sequence" direction="horizontal">
                    {(provided) => (
                      <div 
                        className="flex flex-wrap justify-center gap-2 mb-4 min-h-20"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {sequenceItems.map((item, index) => (
                          <Draggable key={item} draggableId={item} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-3 border-2 border-gray-300 rounded-md bg-background cursor-move"
                              >
                                {item}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <p className="text-sm text-muted-foreground">Перетаскивайте элементы, чтобы расположить их в правильном порядке</p>
              </div>
            )}
          </div>
        );
        
      case 'words':
        return (
          <div className="space-y-4">
            {!showAnswer ? (
              <div className="text-center py-8">
                <p className="text-xl font-bold mb-4">Запомните слова:</p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {question.options?.map((word, index) => (
                    <div key={index} className="p-2 border border-gray-300 rounded">
                      {word}
                    </div>
                  ))}
                </div>
                <p className="text-lg">Осталось {timeLeft} секунд</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {question.options?.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedOptions.includes(option) ? "default" : "outline"}
                    className="justify-start h-auto py-2"
                    onClick={() => handleMultipleSelect(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'images':
        return (
          <div className="space-y-4">
            {!showAnswer ? (
              <div className="text-center py-4">
                <p className="text-xl font-bold mb-4">Запомните изображения:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {question.options?.map((img, index) => (
                    <div key={index} className="border p-1">
                      <img 
                        src={getImageSource(img)} 
                        alt={`Изображение ${index + 1}`} 
                        className="w-full h-auto"
                        onError={() => handleImageError(img)}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-lg">Осталось {timeLeft} секунд</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {question.options?.map((img, index) => (
                  <div 
                    key={index} 
                    className={`border-2 p-1 cursor-pointer ${selectedOptions.includes(img) ? 'border-primary' : 'border-gray-200'}`}
                    onClick={() => handleMultipleSelect(img)}
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
            )}
          </div>
        );
        
      case 'pairs':
        return (
          <div className="space-y-4">
            {!showAnswer ? (
              <div className="text-center py-4">
                <p className="text-xl font-bold mb-4">Запомните соответствия:</p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {question.options?.map((option, index) => {
                    const answer = question.answer_options?.[index];
                    return (
                      <div key={index} className="flex items-center justify-between border p-2 rounded">
                        <span className="font-medium">{option}</span>
                        <span className="text-primary">→</span>
                        <span className="font-medium">{answer}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-lg mt-4">Осталось {timeLeft} секунд</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {question.options?.map((option, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 border p-3 rounded">
                    <Label className="min-w-32 font-medium">{option}</Label>
                    <select
                      className="flex-1 border-2 border-gray-300 p-2 rounded-md"
                      value={pairsSelection[option] || ""}
                      onChange={(e) => handlePairSelection(option, e.target.value)}
                    >
                      <option value="">Выберите...</option>
                      {question.answer_options?.map((answer, i) => (
                        <option key={i} value={answer}>{answer}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'matrix':
        return (
          <div className="space-y-4">
            {!showAnswer ? (
              <div className="text-center py-4">
                <p className="text-xl font-bold mb-4">Запомните матрицу:</p>
                <div className="inline-block border-2 border-gray-300 rounded overflow-hidden">
                  {question.matrix?.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                      {row.map((cell, cellIndex) => (
                        <div
                          key={`${rowIndex}-${cellIndex}`}
                          className="border border-gray-300 p-3 text-center min-w-10"
                        >
                          {cell}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <p className="text-lg mt-4">Осталось {timeLeft} секунд</p>
              </div>
            ) : (
              <>
                {question.question_text && (
                  <p className="text-lg">{question.question_text}</p>
                )}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {question.options?.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedOption === option ? "default" : "outline"}
                      className="justify-start h-auto py-2 text-wrap whitespace-normal"
                      onClick={() => setSelectedOption(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      
      default:
        return <div className="p-4 text-center">Вопрос этого типа в разработке</div>;
    }
  };

  const getSubmitDisabled = () => {
    if (disabled) return true;
    if (timeLeft !== null) return true;
    
    switch (question.type) {
      case 'select':
      case 'words':
      case 'images':
        return selectedOptions.length === 0;
      case 'pairs':
        return question.options?.some(option => !pairsSelection[option]) || false;
      case 'sequence':
        return false; // Для последовательности всегда можно отправить текущий порядок
      default:
        return !selectedOption;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">{question.question}</h2>
        
        {timeLeft !== null ? (
          renderQuestionContent()
        ) : (
          <>
            {renderQuestionContent()}
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={getSubmitDisabled()}
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
