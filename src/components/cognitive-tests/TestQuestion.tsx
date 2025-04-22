import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TestQuestion as TestQuestionType } from "@/types/cognitivetests";
import { motion, AnimatePresence } from "framer-motion";

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
    setAnswer('');
    setSelectedItems([]);
    setShowOptions(true);
    setShowStimulus(false);
    setCurrentStimulus(null);
    setStartTime(null);
    
    if (question.delay && question.delay > 0) {
      if (question.type === 'sequence' || question.type === 'words' || 
          question.type === 'images' || question.type === 'pairs' || 
          question.type === 'matrix' || question.type === 'grid') {
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
        setShowOptions(false);
        
        const delayMs = question.delay * 1000;
        const randomDelay = delayMs + Math.random() * 500;
        
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
        question.type === 'multi_target' || question.multiple_select) {
      onAnswer(question.id, selectedItems.join(','));
    } else {
      onAnswer(question.id, answer);
    }
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'difference':
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
                <motion.img 
                  src={question.image} 
                  alt="Вопрос" 
                  className="max-w-full max-h-64 rounded-md shadow-md" 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
            
            <RadioGroup value={answer} onValueChange={handleSingleOptionSelect}>
              <AnimatePresence>
                {question.options?.map((option, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} disabled={disabled} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer w-full">
                      {option.startsWith('http') ? 
                        <img src={option} alt={`Вариант ${index+1}`} className="max-w-36 max-h-36 rounded-md" /> : 
                        option
                      }
                    </Label>
                  </motion.div>
                ))}
              </AnimatePresence>
            </RadioGroup>
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            
            {question.image && (
              <div className="flex justify-center my-4">
                <motion.img 
                  src={question.image} 
                  alt="Вопрос" 
                  className="max-w-full max-h-64 rounded-md shadow-md" 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
            
            {question.multiple_select ? (
              <div className="space-y-2">
                <p className="font-medium">Выберите все подходящие варианты:</p>
                <AnimatePresence>
                  {question.options?.map((option, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Checkbox 
                        id={`check-${index}`} 
                        checked={selectedItems.includes(option)}
                        onCheckedChange={() => handleMultipleOptionSelect(option)}
                        disabled={disabled}
                      />
                      <label htmlFor={`check-${index}`} className="text-sm font-medium cursor-pointer w-full">
                        {option.startsWith('http') ? 
                          <img src={option} alt={`Вариант ${index+1}`} className="max-w-36 max-h-36 rounded-md" /> : 
                          option
                        }
                      </label>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <RadioGroup value={answer} onValueChange={handleSingleOptionSelect}>
                <AnimatePresence>
                  {question.options?.map((option, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} disabled={disabled} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer w-full">
                        {option.startsWith('http') ? 
                          <img src={option} alt={`Вариант ${index+1}`} className="max-w-36 max-h-36 rounded-md" /> : 
                          option
                        }
                      </Label>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </RadioGroup>
            )}
          </div>
        );
        
      case 'words':
      case 'images':
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            
            {showOptions ? (
              <motion.div 
                className="p-4 border rounded-md bg-accent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {countdown !== null && (
                  <div className="text-right text-sm flex items-center justify-end">
                    <span>Осталось секунд:</span>
                    <motion.div 
                      key={countdown}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded-md font-bold"
                    >
                      {countdown}
                    </motion.div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 justify-center my-4">
                  {question.type === 'words' ? 
                    question.question.split(': ')[1].split(', ').map((word, i) => (
                      <motion.div 
                        key={i} 
                        className="p-2 border rounded bg-background shadow-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                      >
                        {word}
                      </motion.div>
                    )) :
                    question.images?.map((img, i) => (
                      <motion.div 
                        key={i} 
                        className="p-2 border rounded bg-background shadow-sm text-2xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                      >
                        {img}
                      </motion.div>
                    ))
                  }
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-medium">Выберите все элементы, которые были показаны:</p>
                <AnimatePresence>
                  {question.options?.map((option, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Checkbox 
                        id={`check-${index}`} 
                        checked={selectedItems.includes(option)}
                        onCheckedChange={() => handleMultipleOptionSelect(option)}
                        disabled={disabled}
                      />
                      <label htmlFor={`check-${index}`} className="text-sm font-medium cursor-pointer w-full">
                        {option}
                      </label>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        );
        
      case 'sequence':
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            
            {showOptions ? (
              <motion.div 
                className="p-4 border rounded-md bg-accent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {countdown !== null && (
                  <div className="text-right text-sm flex items-center justify-end">
                    <span>Осталось секунд:</span>
                    <motion.div 
                      key={countdown}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded-md font-bold"
                    >
                      {countdown}
                    </motion.div>
                  </div>
                )}
                <div className="flex justify-center my-4">
                  <motion.div 
                    className="text-center text-2xl font-bold tracking-wider bg-background p-6 rounded-lg shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {question.question.split(': ')[1]}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-medium">Введите последовательность, которую вы запомнили:</p>
                <Input 
                  type="text" 
                  placeholder="Введите ответ"
                  value={answer}
                  onChange={handleInputChange}
                  disabled={disabled}
                  className="text-lg py-6 text-center font-medium"
                />
              </motion.div>
            )}
          </div>
        );
        
      case 'quick_choice':
      case 'go_nogo':
        return (
          <div className="space-y-4 text-center">
            <CardDescription>{question.question}</CardDescription>
            
            {showStimulus && (
              <motion.div 
                className="flex items-center justify-center h-32 cursor-pointer"
                onClick={handleReactionClick}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
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
              </motion.div>
            )}
            
            {!showStimulus && !showOptions && (
              <motion.div 
                className="p-4 border rounded animate-pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p>Ожидание... будьте готовы нажать при появлении стимула</p>
              </motion.div>
            )}
          </div>
        );
        
      case 'choice_reaction':
        return (
          <div className="space-y-4 text-center">
            <CardDescription>{question.question}</CardDescription>
            
            {showStimulus && (
              <motion.div 
                className="flex flex-col items-center justify-center space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="flex items-center justify-center h-32"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStimulus === 'red_circle' && (
                    <div className="w-20 h-20 bg-red-500 rounded-full"></div>
                  )}
                  {currentStimulus === 'green_circle' && (
                    <div className="w-20 h-20 bg-green-500 rounded-full"></div>
                  )}
                </motion.div>
                
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => handleChoiceReaction('left')}
                    variant="outline"
                    disabled={disabled}
                    className="hover:scale-105 transition-transform"
                  >
                    Левая
                  </Button>
                  <Button 
                    onClick={() => handleChoiceReaction('right')}
                    variant="outline"
                    disabled={disabled}
                    className="hover:scale-105 transition-transform"
                  >
                    Правая
                  </Button>
                </div>
              </motion.div>
            )}
            
            {!showStimulus && (
              <motion.div 
                className="p-4 border rounded animate-pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p>Ожидание... будьте готовы выбрать правильную кнопку</p>
              </motion.div>
            )}
          </div>
        );
        
      case 'pairs':
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            
            {showOptions ? (
              <motion.div 
                className="p-4 border rounded-md bg-accent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {countdown !== null && (
                  <div className="text-right text-sm flex items-center justify-end">
                    <span>Осталось секунд:</span>
                    <motion.div 
                      key={countdown}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded-md font-bold"
                    >
                      {countdown}
                    </motion.div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 my-4">
                  {question.question.split(': ')[1].split(', ').map((pair, i) => (
                    <motion.div 
                      key={i} 
                      className="p-2 border rounded bg-background text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      {pair}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-medium">Укажите пары для каждой буквы:</p>
                <AnimatePresence>
                  {question.options?.map((option, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center space-x-2 py-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="w-1/4 font-medium">{option}</div>
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
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        );
        
      case 'grid':
      case 'matrix':
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            
            {showOptions ? (
              <motion.div 
                className="p-4 border rounded-md bg-accent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {countdown !== null && (
                  <div className="text-right text-sm flex items-center justify-end">
                    <span>Осталось секунд:</span>
                    <motion.div 
                      key={countdown}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded-md font-bold"
                    >
                      {countdown}
                    </motion.div>
                  </div>
                )}
                <div className="flex justify-center my-4">
                  <div className="grid grid-cols-3 gap-1">
                    {question.type === 'grid' 
                      ? question.grid?.map((row, rowIndex) => (
                          row.map((cell, colIndex) => (
                            <motion.div 
                              key={`${rowIndex}-${colIndex}`} 
                              className="w-12 h-12 flex items-center justify-center border bg-background text-lg shadow-sm"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: (rowIndex * 3 + colIndex) * 0.05 }}
                            >
                              {cell}
                            </motion.div>
                          ))
                        ))
                      : question.matrix?.map((row, rowIndex) => (
                          row.map((cell, colIndex) => (
                            <motion.div 
                              key={`${rowIndex}-${colIndex}`} 
                              className="w-12 h-12 flex items-center justify-center border bg-background text-lg shadow-sm"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: (rowIndex * 3 + colIndex) * 0.05 }}
                            >
                              {cell}
                            </motion.div>
                          ))
                        ))
                    }
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-medium">{question.question_text}</p>
                <RadioGroup value={answer} onValueChange={handleSingleOptionSelect}>
                  <div className="grid grid-cols-3 gap-2">
                    <AnimatePresence>
                      {question.options?.map((option, index) => (
                        <motion.div 
                          key={index} 
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <RadioGroupItem value={option} id={`grid-option-${index}`} disabled={disabled} />
                          <Label htmlFor={`grid-option-${index}`}>{option}</Label>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </RadioGroup>
              </motion.div>
            )}
          </div>
        );
        
      case 'spatial':
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            
            <motion.div 
              className="flex justify-center my-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img src={question.image} alt="Вопрос" className="max-w-full max-h-40 rounded-md shadow-md" />
            </motion.div>
            
            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence>
                {question.options?.map((option, index) => (
                  <motion.div 
                    key={index} 
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <img 
                      src={option} 
                      alt={`Вариант ${index+1}`} 
                      className={`max-w-28 max-h-28 mb-2 rounded-md transition-all ${answer === option ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`} 
                    />
                    <RadioGroup value={answer} onValueChange={handleSingleOptionSelect} className="flex justify-center">
                      <RadioGroupItem value={option} id={`spatial-option-${index}`} disabled={disabled} />
                    </RadioGroup>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
    
      default:
        return (
          <div className="space-y-4">
            <CardDescription>{question.question}</CardDescription>
            
            {question.multiple_select ? (
              <div className="space-y-2">
                <p className="font-medium">Выберите все подходящие варианты:</p>
                <AnimatePresence>
                  {question.options?.map((option, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Checkbox 
                        id={`check-${index}`} 
                        checked={selectedItems.includes(option)}
                        onCheckedChange={() => handleMultipleOptionSelect(option)}
                        disabled={disabled}
                      />
                      <label htmlFor={`check-${index}`} className="text-sm font-medium cursor-pointer w-full">
                        {option.startsWith('http') ? 
                          <img src={option} alt={`Вариант ${index+1}`} className="max-w-36 max-h-36 rounded-md" /> : 
                          option
                        }
                      </label>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              question.options && (
                <RadioGroup value={answer} onValueChange={handleSingleOptionSelect}>
                  <AnimatePresence>
                    {question.options.map((option, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} disabled={disabled} />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer w-full">{option}</Label>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </RadioGroup>
              )
            )}
          </div>
        );
    }
  };
  
  const showSubmitButton = () => {
    if (question.type.includes('reaction') || 
        question.type === 'quick_choice' || 
        question.type === 'go_nogo' || 
        question.type === 'choice_reaction') {
      return false;
    }
    
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
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>
          {question.type === 'sequence' && showOptions 
            ? "Запомните последовательность" 
            : question.type === 'words' && showOptions
            ? "Запомните слова"
            : question.type === 'images' && showOptions
            ? "Запомните изображения"
            : question.type === 'pairs' && showOptions
            ? "Запомните пары"
            : "Вопрос"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderQuestionContent()}
        
        {showSubmitButton() && (
          <motion.div 
            className="mt-4 flex justify-end"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button 
              onClick={handleSubmitAnswer} 
              disabled={disabled}
              className="hover:scale-105 transition-transform"
            >
              Ответить
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
