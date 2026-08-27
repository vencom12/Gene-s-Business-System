import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  const scrollYRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      // Save scroll position
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;

      // Lock body at current scroll position to avoid layout shift
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';

      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      // Restore body styles and scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';

      window.removeEventListener('keydown', handleKeyDown);

      // Restore scroll position
      window.scrollTo(0, scrollYRef.current || 0);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  const modal = (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/65 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Center on larger screens; top-align on small screens */}
      <div className="flex min-h-full items-start sm:items-center justify-center">
        <div
          className={`relative w-[92vw] sm:w-full ${maxWidthClasses[maxWidth]} max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-up`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header (sticky so it remains visible while body scrolls) */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-amber-50/60 shrink-0 sticky top-0 z-10">
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 p-1.5 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );

  // Render into document.body so the modal is always viewport-relative
  return ReactDOM.createPortal(modal, document.body);
};
