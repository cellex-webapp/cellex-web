declare global {
    interface IShop {
        _id: string;
        vendor_id: string;
        shop_name: string;
        description: string;
        logo_url: string;
        address: string;
        phone_number: string;
        email: string;
        is_verified: boolean;
        rating: number;
        created_at: Date;
        updated_at: Date;
    }
}