import React, { useState, useEffect } from 'react';
import { Grade, Book, LessonContent, QuizItem, Flashcard } from '../types';
import { ArrowRightIcon, BrainIcon, DocumentTextIcon, SparklesIcon, XCircleIcon } from './icons';

interface LessonViewProps {
  grade: Grade;
  book: Book;
  onBack: () => void;
  content: LessonContent | null;
  onRegenerateQuiz: () => void;
  isRegeneratingQuiz: boolean;
  error: string | null;
  clearError: () => void;
}

type ViewType = 'explanation' | 'quiz' | 'flashcards';
type ExplanationLength = 'short' | 'medium' | 'long';


const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-initial sm:px-6 py-3 text-sm sm:text-base font-semibold rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${
        active ? 'bg-cyan-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
};

const LengthButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
      isActive ? 'bg-white text-cyan-700 shadow' : 'bg-transparent text-slate-600 hover:bg-slate-50'
    }`}
  >
    {children}
  </button>
);


const QuizComponent: React.FC<{
    quiz: QuizItem[];
    onRegenerateQuiz: () => void;
    isRegeneratingQuiz: boolean;
}> = ({ quiz, onRegenerateQuiz, isRegeneratingQuiz }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(Array(quiz.length).fill(null));
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers(Array(quiz.length).fill(null));
        setShowResults(false);
    }, [quiz]);


    const handleAnswerSelect = (option: string) => {
        if (showResults) return;
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIndex] = option;
        setSelectedAnswers(newAnswers);
    };
    
    const score = selectedAnswers.filter((answer, index) => answer === quiz[index].correctAnswer).length;

    if (showResults) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-lg animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 text-center">ئەنجامی تاقیکردنەوە</h3>
                <p className="text-center text-3xl font-bold mb-6">
                    {score} / {quiz.length}
                </p>
                <div className="space-y-4">
                    {quiz.map((item, index) => (
                        <div key={index} className={`p-4 rounded-lg ${selectedAnswers[index] === item.correctAnswer ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}>
                            <p className="font-semibold">{index + 1}. {item.question}</p>
                            <p className="text-sm mt-2">وەڵامی تۆ: <span className="font-bold">{selectedAnswers[index] || "بێ وەڵام"}</span></p>
                            <p className="text-sm mt-1">وەڵامی ڕاست: <span className="font-bold text-green-700">{item.correctAnswer}</span></p>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-6 flex justify-center items-center gap-4 flex-wrap">
                    <button onClick={() => { setCurrentQuestionIndex(0); setSelectedAnswers(Array(quiz.length).fill(null)); setShowResults(false); }} className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                        دووبارە کردنەوە
                    </button>
                    <button
                        onClick={onRegenerateQuiz}
                        disabled={isRegeneratingQuiz}
                        className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isRegeneratingQuiz ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>...دروست دەکرێت</span>
                            </>
                        ) : (
                            'دروستکردنی پرسیاری نوێ'
                        )}
                    </button>
                </div>
            </div>
        );
    }
    
    const currentQuestion = quiz[currentQuestionIndex];

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg animate-fade-in">
            <p className="text-slate-500 mb-2 text-sm">پرسیاری {currentQuestionIndex + 1} لە {quiz.length}</p>
            <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>
            <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full text-right p-4 border rounded-lg transition-all text-lg ${selectedAnswers[currentQuestionIndex] === option ? 'bg-cyan-500 text-white border-cyan-600 ring-2 ring-cyan-400' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-5 py-2 bg-slate-200 rounded-lg disabled:opacity-50"
                >
                    پێشوو
                </button>
                {currentQuestionIndex === quiz.length - 1 ? (
                     <button onClick={() => setShowResults(true)} className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                        پیشاندانی ئەنجام
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.length - 1, prev + 1))}
                        disabled={currentQuestionIndex === quiz.length - 1}
                        className="px-5 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
                    >
                        دواتر
                    </button>
                )}
            </div>
        </div>
    );
};

const FlashcardComponent: React.FC<{ flashcard: Flashcard }> = ({ flashcard }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    return (
        <div className="[perspective:1000px] w-full h-64" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                <div className="absolute w-full h-full flex items-center justify-center p-6 bg-white rounded-lg shadow-xl border border-slate-200 [backface-visibility:hidden]">
                    <p className="text-2xl font-bold text-center">{flashcard.term}</p>
                </div>
                <div className="absolute w-full h-full flex items-center justify-center p-6 bg-cyan-600 text-white rounded-lg shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <p className="text-xl text-center">{flashcard.definition}</p>
                </div>
            </div>
        </div>
    );
}

const LessonView: React.FC<LessonViewProps> = ({ grade, book, onBack, content, onRegenerateQuiz, isRegeneratingQuiz, error, clearError }) => {
  const [activeTab, setActiveTab] = useState<ViewType>('explanation');
  const [explanationLength, setExplanationLength] = useState<ExplanationLength>('medium');

  const renderActiveTabContent = () => {
    if (!content) {
      return <div className="text-center p-10 bg-white rounded-lg shadow-md">هیچ داتایەک نەدۆزرایەوە.</div>;
    }

    switch (activeTab) {
      case 'explanation':
        return (
          <div className="p-6 sm:p-8 bg-white rounded-lg shadow-lg animate-fade-in">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h3 className="text-2xl font-bold border-r-4 border-cyan-500 pr-4">شیکردنەوەی وانەکە</h3>
                <div className="flex items-center space-x-1 rtl:space-x-reverse p-1 bg-slate-200 rounded-lg">
                    <LengthButton onClick={() => setExplanationLength('long')} isActive={explanationLength === 'long'}>درێژ</LengthButton>
                    <LengthButton onClick={() => setExplanationLength('medium')} isActive={explanationLength === 'medium'}>ناوەند</LengthButton>
                    <LengthButton onClick={() => setExplanationLength('short')} isActive={explanationLength === 'short'}>کورت</LengthButton>
                </div>
            </div>
            <div className="prose prose-lg max-w-none text-slate-700 leading-loose" 
                 dangerouslySetInnerHTML={{ __html: content.explanation[explanationLength].replace(/\n/g, '<br />') }} />
          </div>
        );
      case 'quiz':
        return <QuizComponent 
            quiz={content.quiz} 
            onRegenerateQuiz={onRegenerateQuiz} 
            isRegeneratingQuiz={isRegeneratingQuiz} 
        />;
      case 'flashcards':
        return (
            <div className="p-6 bg-white rounded-lg shadow-lg animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 text-center">فلاش کارتەکان</h3>
                <p className="text-center text-slate-500 mb-8">کرتە لە کارتەکە بکە بۆ بینینی وەڵامەکەی</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {content.flashcards.map((card, index) => (
                        <FlashcardComponent key={index} flashcard={card} />
                    ))}
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">{content?.topic}</h1>
                <p className="text-slate-500">{book.name} - {grade.name}</p>
            </div>
            <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
                <ArrowRightIcon className="h-5 w-5" />
                <span>وانەیەکی تر</span>
            </button>
        </div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="p-1 rounded-full hover:bg-red-200">
                <XCircleIcon className="w-5 h-5 text-red-700"/>
            </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 rtl:sm:space-x-reverse mb-8 p-2 bg-slate-200 rounded-lg">
        <TabButton active={activeTab === 'explanation'} onClick={() => setActiveTab('explanation')}>
          <span className="flex items-center justify-center gap-2"><DocumentTextIcon className="w-5 h-5"/> فێرکردن</span>
        </TabButton>
        <TabButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')}>
          <span className="flex items-center justify-center gap-2"><BrainIcon className="w-5 h-5"/> تاقیکردنەوە</span>
        </TabButton>
        <TabButton active={activeTab === 'flashcards'} onClick={() => setActiveTab('flashcards')}>
          <span className="flex items-center justify-center gap-2"><SparklesIcon className="w-5 h-5"/> فلاش کارت</span>
        </TabButton>
      </div>
      <div>{renderActiveTabContent()}</div>
    </div>
  );
};

export default LessonView;