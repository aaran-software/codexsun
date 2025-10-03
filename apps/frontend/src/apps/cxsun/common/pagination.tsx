// File: components/pagination.tsx
// Description: Pagination component for data table.
// Notes for study:
// - Renders page numbers, navigation buttons, and rows per page selector.
// - Uses getPageNumbers utility (assumed defined in lib/utils).
// - Fixed by adding missing imports for icons and correcting Select imports.

import {
    ChevronLeftIcon,
    ChevronRightIcon,
    DoubleArrowLeftIcon,
    DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { cn } from '@/lib/utils' // Assuming getPageNumbers is in lib/utils
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

// Assume getPageNumbers is defined as:
export function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
}

type DataTablePaginationProps<TData> = {
    table: Table<TData>
}

export function DataTablePagination<TData>({
                                               table,
                                           }: DataTablePaginationProps<TData>) {
    const currentPage = table.getState().pagination.pageIndex + 1
    const totalPages = table.getPageCount()
    const pageNumbers = getPageNumbers(currentPage, totalPages)

    return (
        <div
            className={cn(
                'flex items-center justify-between overflow-clip px-2',
                '@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4'
            )}
            style={{ overflowClipMargin: 1 }}
        >
            <div className='flex w-full items-center justify-between'>
                <div className='flex w-[100px] items-center justify-center text-sm font-medium @2xl/content:hidden'>
                    Page {currentPage} of {totalPages}
                </div>
                <div className='flex items-center gap-2 @max-2xl/content:flex-row-reverse'>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger className='h-8 w-[70px]'>
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent side='top'>
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className='hidden text-sm font-medium sm:block'>Rows per page</p>
                    <Button
                        variant='outline'
                        className='size-8 p-0 @max-md/content:hidden'
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className='sr-only'>Go to first page</span>
                        <DoubleArrowLeftIcon className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='outline'
                        className='size-8 p-0'
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className='sr-only'>Go to previous page</span>
                        <ChevronLeftIcon className='h-4 w-4' />
                    </Button>
                    {pageNumbers.map((pageNumber, index) => (
                        <div key={`${pageNumber}-${index}`} className='flex items-center'>
                            {pageNumber === '...' ? (
                                <span className='text-muted-foreground px-1 text-sm'>...</span>
                            ) : (
                                <Button
                                    variant={currentPage === pageNumber ? 'default' : 'outline'}
                                    className='h-8 min-w-8 px-2'
                                    onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                                >
                                    <span className='sr-only'>Go to page {pageNumber}</span>
                                    {pageNumber}
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        variant='outline'
                        className='size-8 p-0'
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className='sr-only'>Go to next page</span>
                        <ChevronRightIcon className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='outline'
                        className='size-8 p-0 @max-md/content:hidden'
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className='sr-only'>Go to last page</span>
                        <DoubleArrowRightIcon className='h-4 w-4' />
                    </Button>
                </div>
            </div>
        </div>
    )
}