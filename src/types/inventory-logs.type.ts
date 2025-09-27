declare global {
    interface IInventoryLog {
        _id: string;
        product_id: string;
        type: InventoryLogType;
        quantity_change: number;
        old_stock_quantity: number;
        new_stock_quantity: number;
        reference_id?: string;
        user_id: string;
        notes?: string;
        created_at: Date;
    }
}