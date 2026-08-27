import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [6, 12, 24, 48],
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 text-xs text-slate-600">
      {/* Items Count and Items Per Page selection */}
      <div className="flex items-center gap-3">
        <span>
          Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalItems}</span> items
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous Page Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              currentPage === 1
                ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95'
            }`}
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) => {
              if (typeof page === 'string') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 font-medium">
                    ...
                  </span>
                );
              }

              const isCurrent = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`min-w-[32px] h-[32px] rounded-lg font-semibold text-xs transition-all ${
                    isCurrent
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Page Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              currentPage === totalPages
                ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95'
            }`}
            aria-label="Next Page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
