import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixSymbol?: string;
  suffixSymbol?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  prefixSymbol,
  suffixSymbol,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixSymbol && (
          <span className="absolute left-3 text-slate-500 font-medium text-sm select-none pointer-events-none">
            {prefixSymbol}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
            prefixSymbol ? 'pl-8' : ''
          } ${suffixSymbol ? 'pr-12' : ''} ${error ? 'border-rose-500 ring-1 ring-rose-500' : ''} ${className}`}
          {...props}
        />
        {suffixSymbol && (
          <span className="absolute right-3 text-slate-500 text-xs font-medium select-none pointer-events-none">
            {suffixSymbol}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
      {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  );
};
