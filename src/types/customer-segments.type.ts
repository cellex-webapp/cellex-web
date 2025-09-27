declare global {
    interface ICustomerBenefits {
        free_shipping: boolean;
        priority_support: boolean;
        exclusive_products: boolean;
        early_access: boolean;
    }

    interface ICouponRules {
        daily_coupon: boolean;
        monthly_coupon: boolean;
        birthday_coupon: boolean;
        special_events: boolean;
    }
    interface ICustomerSegment {
        _id: string;
        name: string;
        min_spend: number;
        max_spend: number;
        benefits: ICustomerBenefits;
        coupon_rules: ICouponRules;
        icon: string;
        level: number;
        maintenance_period: number;
        created_at: Date;
        updated_at: Date;
    }
}