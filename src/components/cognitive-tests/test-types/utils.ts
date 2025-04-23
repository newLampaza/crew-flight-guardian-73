
import { TestQuestion } from "@/types/cognitivetests";

// Fallback изображение Яндекса
export const yandexFallbackUrl = "https://yastatic.net/s3/home/pages-blocks/illustrations/search/ru/search-image-1.png";

// Список реальных фотографий с Unsplash
export const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&auto=format&fit=crop&q=60",
];

export interface TestQuestionProps {
  question: TestQuestion;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
}

// Возвращает настоящую фотографию из Unsplash, если источник picsum или невалидный
export const getSafeImageUrl = (imgUrl: string) => {
  if (!imgUrl || imgUrl.includes('picsum.photos')) {
    const rand = Math.floor(Math.random() * UNSPLASH_IMAGES.length);
    return UNSPLASH_IMAGES[rand];
  }
  return imgUrl;
};

