
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="w-16 h-16 border-4 border-t-4 border-cyan-500 border-solid rounded-full animate-spin border-t-transparent"></div>
    </div>
  );
};

export default LoadingSpinner;
