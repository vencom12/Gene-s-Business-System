import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-xl transition-all duration-150 flex items-center justify-center gap-2 active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm';
  
  const variants = {
    primary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
    secondary: 'bg-slate-700 hover:bg-slate-800 text-white shadow-slate-200',
    outline: 'border-2 border-amber-600 text-amber-700 hover:bg-amber-50',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
    ghost: 'text-slate-600 hover:bg-slate-100 shadow-none',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2.5 min-h-[44px]',
    lg: 'text-base px-6 py-3 min-h-[50px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
