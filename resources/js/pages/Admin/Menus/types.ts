export interface Menu {
    id: number;
    menu_group_id: number;
    title: string;
    url: string | null;
    feature_key: string | null;
    position: number;
    is_active: boolean;
    deleted_at: string | null;

    group?: { id: number; name: string };
}

export type ModalMode = 'create' | 'edit' | null;
