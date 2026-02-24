// resources/js/Pages/Admin/MenuGroups/types.ts
export interface MenuGroup {
    id: number;
    name: string;
    location: string | null;
    is_active: boolean;
    menus_count: number;
    deleted_at: string | null;
}

export type ModalMode = 'create' | 'edit' | null;
