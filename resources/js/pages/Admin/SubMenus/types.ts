// resources/js/Pages/Admin/SubMenus/types.ts
export interface SubMenu {
    id: number;
    menu_id: number;
    title: string;
    url: string | null;
    feature_key: string | null;
    position: number;
    is_active: boolean;

    menu?: { id: number; title: string };
}

export type ModalMode = 'create' | 'edit' | null;
