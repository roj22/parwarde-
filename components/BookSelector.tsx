
import React from 'react';
import { Grade, Book } from '../types';
import Card from './Card';
import { ArrowRightIcon } from './icons';

interface BookSelectorProps {
  grade: Grade;
  onSelectBook: (book: Book) => void;
  onBack: () => void;
}

const BookSelector: React.FC<BookSelectorProps> = ({ grade, onSelectBook, onBack }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">کتێبێک هەڵبژێرە</h1>
            <p className="text-slate-500">بۆ {grade.name}</p>
        </div>
        <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
        >
            <ArrowRightIcon className="h-5 w-5" />
            <span>گەڕانەوە</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {grade.books.map((book) => (
          <Card key={book.id} onClick={() => onSelectBook(book)}>
            <div className="text-6xl mb-4">{book.icon}</div>
            <h2 className="text-xl font-semibold">{book.name}</h2>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookSelector;
