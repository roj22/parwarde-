export interface Book {
  id: string;
  name: string;
  icon: string;
}

export interface Grade {
  id: string;
  name: string;
  books: Book[];
}

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Flashcard {
  term: string;
  definition: string;
}

export interface LessonContent {
  topic: string;
  explanation: {
    short: string;
    medium: string;
    long: string;
  };
  quiz: QuizItem[];
  flashcards: Flashcard[];
}
