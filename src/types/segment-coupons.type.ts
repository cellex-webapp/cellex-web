declare global {
    interface IIssueSchedule {
        hour: number;
        day_of_month?: number;
        day_of_week?: number;
        months?: number[];
    }

    interface ISpecialConditions {
        categories?: string[];
        products?: string[];
        min_segment_days?: number;
    }

    interface ISegmentCoupon {
        _id: string;
        segment_id: string;
        coupon_type: CouponType;
        title: string;
        description: string;
        discount_type: DiscountType;
        discount_value: number;
        min_order_amount: number;
        max_discount_amount: number;
        valid_hours: number;
        issue_schedule: IIssueSchedule;
        special_conditions: ISpecialConditions;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }
}