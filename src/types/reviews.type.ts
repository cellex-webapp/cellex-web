declare global {
    interface IModerationResult {
        flagged: boolean;
        categories: string[];
        category_scores: Record<string, number>;
    }

    interface IReview {
        _id: string;
        client_id: string;
        product_id: string;
        order_id: string;
        rating: number;
        title: string;
        comment: string;
        images: string[];
        status: ReviewStatus;
        moderation_result: IModerationResult;
        approved: boolean;
        vendor_response?: string;
        created_at: Date;
        updated_at: Date;
    }
}