import React, { useState, useCallback } from 'react';
import { Grade, Book, LessonContent } from './types';
import { GRADES } from './constants';
import Header from './components/Header';
import GradeSelector from './components/GradeSelector';
import BookSelector from './components/BookSelector';
import LessonPrepView from './components/UploadView'; // Renamed component, filename kept for simplicity
import LessonView from './components/LessonView';
import { ArrowRightIcon } from './components/icons';
import { generateLessonContent, generateNewQuiz } from './services/geminiService';

type View = 'grades' | 'books' | 'lessonPrep' | 'lesson';

interface ImageFile {
    inlineData: {
      mimeType: string;
      data: string;
    };
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('grades');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonImages, setLessonImages] = useState<ImageFile[]>([]);
  const [isRegeneratingQuiz, setIsRegeneratingQuiz] = useState(false);

  const handleSelectGrade = useCallback((grade: Grade) => {
    setSelectedGrade(grade);
    setCurrentView('books');
  }, []);

  const handleSelectBook = useCallback((book: Book) => {
    setSelectedBook(book);
    setCurrentView('lessonPrep');
  }, []);

  const handleGenerate = useCallback(async (images: ImageFile[], numQuestions: string) => {
    if (!selectedGrade || !selectedBook) return;

    setIsLoading(true);
    setError(null);
    setLessonImages(images); // Store images for potential quiz regeneration
    try {
      const result = await generateLessonContent(selectedGrade.name, selectedBook.name, images, numQuestions);
      setLessonContent(result);
      setCurrentView('lesson');
    } catch (e: any) {
      setError(e.message || 'هەڵەیەک ڕوویدا');
      setCurrentView('lessonPrep'); // Stay on prep view to show error
    } finally {
      setIsLoading(false);
    }
  }, [selectedGrade, selectedBook]);

  const handleRegenerateQuiz = useCallback(async () => {
    if (!selectedGrade || !selectedBook || !lessonContent || lessonImages.length === 0) return;

    setIsRegeneratingQuiz(true);
    setError(null);
    try {
        const numQuestions = lessonContent.quiz.length.toString();
        const newQuiz = await generateNewQuiz(
            selectedGrade.name,
            selectedBook.name,
            lessonImages,
            numQuestions
        );
        setLessonContent(prev => prev ? { ...prev, quiz: newQuiz } : null);
    } catch (e: any) {
        setError(e.message || 'هەڵەیەک لە دروستکردنی پرسیاری نوێدا ڕوویدا');
    } finally {
        setIsRegeneratingQuiz(false);
    }
  }, [selectedGrade, selectedBook, lessonContent, lessonImages]);


  const resetSelection = useCallback(() => {
    setCurrentView('grades');
    setSelectedGrade(null);
    setSelectedBook(null);
    setLessonContent(null);
    setError(null);
    setLessonImages([]);
  }, []);

  const backToGrades = useCallback(() => {
    setCurrentView('grades');
    setSelectedGrade(null);
    setSelectedBook(null);
    setLessonImages([]);
  }, []);

  const backToBooks = useCallback(() => {
    setCurrentView('books');
    setSelectedBook(null);
    setLessonContent(null);
    setLessonImages([]);
  }, []);
  
  const backToLessonPrep = useCallback(() => {
    setCurrentView('lessonPrep');
    setLessonContent(null);
    setError(null);
  }, []);


  const renderContent = () => {
    switch (currentView) {
      case 'grades':
        return <GradeSelector grades={GRADES} onSelectGrade={handleSelectGrade} />;
      case 'books':
        if (!selectedGrade) return null;
        return <BookSelector grade={selectedGrade} onSelectBook={handleSelectBook} onBack={backToGrades} />;
      case 'lessonPrep':
        if (!selectedGrade || !selectedBook) return null;
        return (
            <LessonPrepView 
                grade={selectedGrade} 
                book={selectedBook} 
                onGenerate={handleGenerate} 
                onBack={backToBooks}
                isLoading={isLoading}
                error={error}
            />
        );
      case 'lesson':
        if (!selectedGrade || !selectedBook || !lessonContent) return null;
        return (
            <LessonView 
                grade={selectedGrade} 
                book={selectedBook}
                onBack={backToLessonPrep}
                content={lessonContent}
                onRegenerateQuiz={handleRegenerateQuiz}
                isRegeneratingQuiz={isRegeneratingQuiz}
                error={error}
                clearError={() => setError(null)}
            />
        );
      default:
        return <GradeSelector grades={GRADES} onSelectGrade={handleSelectGrade} />;
    }
  };
  
  const Breadcrumbs = () => (
     <div className="mb-6 text-sm text-gray-500 flex items-center flex-wrap gap-2">
        {selectedGrade && (
            <button onClick={backToBooks} className={`hover:underline ${currentView === 'books' && 'font-semibold text-slate-700'}`}>{selectedGrade.name}</button>
        )}
        {selectedBook && (
            <>
                <ArrowRightIcon className="h-4 w-4 transform rotate-180" />
                 <button onClick={backToLessonPrep} className={`hover:underline ${currentView === 'lessonPrep' && 'font-semibold text-slate-700'}`}>{selectedBook.name}</button>
            </>
        )}
        {currentView === 'lesson' && lessonContent && (
             <>
                <ArrowRightIcon className="h-4 w-4 transform rotate-180" />
                <span className="font-semibold text-slate-700">{lessonContent.topic}</span>
            </>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onHomeClick={resetSelection} />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <Breadcrumbs />
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-sm text-slate-500">
        <p>.دروستکراوە بەهیوای سوود</p>
      </footer>
    </div>
  );
};

export default App;
