import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { cn } from '@/components/lib/utils';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
                             currentPage,
                             totalPages,
                             pageSize,
                             onPageChange,
                             onPageSizeChange,
                             pageSizeOptions = [10, 20, 30, 50, 100, 200, 500, 1000],
                             className,
                           }: PaginationProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className={cn('flex items-center justify-between px-2', className)}>
      <div className="flex items-center gap-2">
        <Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm font-medium">Rows per page</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <DoubleArrowLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        {pageNumbers.map((pageNumber, index) => (
          <React.Fragment key={`${pageNumber}-${index}`}>
            {pageNumber === '...' ? (
              <span className="text-muted-foreground px-1 text-sm">...</span>
            ) : (
              <Button
                variant={currentPage === pageNumber ? 'default' : 'outline'}
                className="h-8 min-w-8 px-2"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            )}
          </React.Fragment>
        ))}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <DoubleArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-sm font-medium">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 4) pages.push('...');
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 3) pages.push('...');
    pages.push(totalPages);
  }
  return pages;
}