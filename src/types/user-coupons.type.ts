declare global {
    interface IUserCoupon {
        _id: string;
        user_id: string;
        promotion_id?: string;
        segment_coupon_id?: string;
        title: string;
        discount_type: DiscountType;
        discount_value: number;
        min_order_amount: number;
        max_discount_amount: number;
        applicable_products: string[];
        issued_date: Date;
        expires_at: Date;
        status: CouponStatus;
        created_at: Date;
    }
}