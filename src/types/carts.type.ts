declare global {
  interface ICartItem {
    product_id: string;
    quantity: number;
    price: number;
  }
  interface ICart {
    _id: string;
    client_id: string;
    items: ICartItem[];
    total_price: number;
    total_quantity: number;
    created_at: Date;
    updated_at: Date;
  }
}