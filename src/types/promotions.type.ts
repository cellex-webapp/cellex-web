declare global {
    interface IPromotion {
        _id: string;
        code: string;
        title: string;
        description: string;
        discount_type: DiscountType;
        discount_value: number;
        min_order_amount: number;
        max_discount_amount: number;
        max_usage: number;
        times_used: number;
        applicable_products: string[];
        start_date: Date;
        end_date: Date;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }
}