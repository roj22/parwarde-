
import React from 'react';
import { BookIcon } from './icons';

interface HeaderProps {
    onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={onHomeClick} className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
            <BookIcon className="h-8 w-8 text-cyan-600" />
            <span className="text-xl font-bold text-slate-800">پەروەردە و فێرکردن</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
