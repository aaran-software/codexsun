// File: components/bulk-actions.tsx
// Description: Bulk actions component for data table.
// Notes for study:
// - Displays when rows are selected.
// - Includes clear selection button and custom children actions.
// - Fixed by adding missing imports and correcting className usage.
// - Added missing CSS for animations if needed, but assumed utils are defined.

import React, {useState, useEffect, useRef} from 'react'
import {type Table} from '@tanstack/react-table'
import {X} from 'lucide-react'
import {cn} from '@/lib/utils'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'

type DataTableBulkActionsProps<TData> = {
    table: Table<TData>
    entityName: string
    children: React.ReactNode
}

export function DataTableBulkActions<TData>({
                                                table,
                                                entityName,
                                                children,
                                            }: DataTableBulkActionsProps<TData>): React.ReactNode | null {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedCount = selectedRows.length
    const toolbarRef = useRef<HTMLDivElement>(null)
    const [announcement, setAnnouncement] = useState('')

    useEffect(() => {
        if (selectedCount > 0) {
            const message = `${selectedCount} ${entityName}${selectedCount > 1 ? 's' : ''} selected. Bulk actions toolbar is available.`
            setAnnouncement(message)

            const timer = setTimeout(() => setAnnouncement(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [selectedCount, entityName])

    const handleClearSelection = () => {
        table.resetRowSelection()
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        const buttons = toolbarRef.current?.querySelectorAll('button')
        if (!buttons) return

        const currentIndex = Array.from(buttons).findIndex((button) => button === document.activeElement)
        if (event.key === 'ArrowRight' && currentIndex < buttons.length - 1) {
            buttons[currentIndex + 1].focus()
        } else if (event.key === 'ArrowLeft' && currentIndex > 0) {
            buttons[currentIndex - 1].focus()
        }
    }

    if (selectedCount === 0) return null

    return (
        <>
            <div className='sr-only' aria-live='polite'>
                {announcement}
            </div>
            <div
                ref={toolbarRef}
                aria-label={`Bulk actions for ${selectedCount} selected ${entityName}${selectedCount > 1 ? 's' : ''}`}
                aria-describedby='bulk-actions-description'
                tabIndex={-1}
                onKeyDown={handleKeyDown}
                className={cn(
                    'fixed inset-x-0 bottom-0 z-50 mx-auto max-w-7xl px-4',
                    'animate-in slide-in-from-bottom-5 duration-300 ease-out',
                    'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none'
                )}
            >
                <div
                    className={cn(
                        'p-2 shadow-xl',
                        'rounded-xl border',
                        'bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur-lg',
                        'flex items-center gap-x-2'
                    )}
                >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={handleClearSelection}
                                className='size-6 rounded-full'
                                aria-label='Clear selection'
                                title='Clear selection (Escape)'
                            >
                                <X />
                                <span className='sr-only'>Clear selection</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Clear selection (Escape)</p>
                        </TooltipContent>
                    </Tooltip>

                    <Separator
                        className='h-5'
                        orientation='vertical'
                        aria-hidden='true'
                    />

                    <div
                        className='flex items-center gap-x-1 text-sm'
                        id='bulk-actions-description'
                    >
                        <Badge
                            variant='default'
                            className='min-w-8 rounded-lg'
                            aria-label={`${selectedCount} selected`}
                        >
                            {selectedCount}
                        </Badge>{' '}
                        <span className='hidden sm:inline'>
              {entityName}
                            {selectedCount > 1 ? 's' : ''}
            </span>{' '}
                        selected
                    </div>

                    <Separator
                        className='h-5'
                        orientation='vertical'
                        aria-hidden='true'
                    />

                    {children}
                </div>
            </div>
        </>
    )
}