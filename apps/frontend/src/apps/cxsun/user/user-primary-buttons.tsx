// File: user-primary-buttons.tsx
// Description: User-specific primary buttons.
// Notes for study:
// - Uses generic context with type User.
// - Pattern can be replicated for other entities.

import { MailPlus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDataContext } from '@/apps/cxsun/common/data-provider';

export function UsersPrimaryButtons() {
    const { setOpen } = useDataContext<unknown>(); // Use unknown if type is not specific, but better User if possible.
    return (
        <div className='flex gap-2'>
            <Button variant='outline' className='space-x-1' onClick={() => setOpen('invite')}>
                <span>Invite User</span> <MailPlus size={18} />
            </Button>
            <Button className='space-x-1' onClick={() => setOpen('add')}>
                <span>Add User</span> <UserPlus size={18} />
            </Button>
        </div>
    );
}