import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
