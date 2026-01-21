export interface Item {
    id: number;
    name: string;
    quantity: number;
    unit?: string;
    expiration_date?: string;
    nutritional_info?: any;
    notes?: string;
    fridge_id: number;
}

export interface Fridge {
    id: number;
    name: string;
    user_id: number;
    items: Item[];
}
