import React from 'react';

interface CardProps {
  onClick: () => void;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-md p-4 text-center w-full h-full flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform duration-300 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
    >
      {children}
    </button>
  );
};

export default Card;
