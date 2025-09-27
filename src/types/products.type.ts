declare global {
    interface IProduct {
        _id: string;
        shop_id: string;
        category_id: string;
        name: string;
        slug: string;
        description: string;
        short_description: string;
        images: string[];
        price: number;
        sale_off: number;
        final_price: number;
        stock_quantity: number;
        attributes: IProductAttribute[];
        specifications: Record<string, any>;
        weight: number;
        average_rating: number;
        review_count: number;
        purchase_count: number;
        is_published: boolean;
        created_at: Date;
        updated_at: Date;
    }

    interface IProductAttribute {
        name: string;
        value: string;
    }
}
 