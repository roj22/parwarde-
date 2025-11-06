import React, { useState } from 'react';
import { Grade } from '../types';
import Card from './Card';
import { EducationIcon } from './icons';

interface GradeSelectorProps {
  grades: Grade[];
  onSelectGrade: (grade: Grade) => void;
}

const GradeSelector: React.FC<GradeSelectorProps> = ({ grades, onSelectGrade }) => {
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);

  const gradeGroups = [
    { title: 'بنەڕەتی (١ - ٣)', grades: grades.slice(0, 3) },
    { title: 'بنەڕەتی (٤ - ٦)', grades: grades.slice(3, 6) },
    { title: 'ناوەندی (٧ - ٩)', grades: grades.slice(6, 9) },
    { title: 'ئامادەیی (١٠ - ١٢)', grades: grades.slice(9, 12) },
  ];

  const groupColors = [
    { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600' },
    { bg: 'bg-rose-500', hover: 'hover:bg-rose-600' },
    { bg: 'bg-amber-500', hover: 'hover:bg-amber-600' },
    { bg: 'bg-teal-500', hover: 'hover:bg-teal-600' },
  ];

  return (
    <div>
      <div className="text-center mb-4">
          <EducationIcon className="w-20 h-20 mx-auto text-cyan-600" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-slate-800">فێركردن بە ژیری دەستكرد</h1>
      <p className="text-center text-xl text-rose-800 mb-12">
        ئامرازێكە بۆ فێركردن لەلایەن <strong className="font-bold text-rose-900">سەنگەر شنۆیی</strong> بە هاوكاری ژیریی دەستكرد بەرهەم هاتووە
      </p>

      <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">قۆناغێک هەڵبژێرە</h2>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6">
          {gradeGroups.map((group, index) => {
            const color = groupColors[index];
            const isActive = activeGroupIndex === index;
            return (
                <button
                key={index}
                onClick={() => setActiveGroupIndex(index)}
                className={`p-3 sm:p-4 rounded-lg shadow-md transition-all duration-300 text-center font-semibold text-white text-sm sm:text-base focus:outline-none 
                    ${color.bg} ${color.hover}
                    ${isActive
                        ? 'transform scale-105 shadow-xl ring-4 ring-offset-2 ring-offset-slate-50 ring-white/50'
                        : 'opacity-80 hover:opacity-100'
                    }`
                }
                aria-pressed={isActive}
                >
                {group.title}
                </button>
            );
          })}
        </div>

        {activeGroupIndex !== null && (
          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md border border-slate-200 animate-fade-in">
            <div className="grid grid-cols-3 gap-4">
              {gradeGroups[activeGroupIndex].grades.map((grade) => (
                <Card key={grade.id} onClick={() => onSelectGrade(grade)}>
                  <div className="text-3xl md:text-4xl mb-2">🎓</div>
                  <h4 className="text-xs text-center md:text-sm font-semibold">{grade.name}</h4>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeSelector;
