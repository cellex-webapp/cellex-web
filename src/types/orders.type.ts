declare global {
  export interface IOrderItem {
    product_id: string;
    shop_id: string;
    name: string;
    quantity: number;
    price: number;
  }
  interface IOrder {
    _id: string;
    order_code: string;
    client_id: string;
    items: IOrderItem[];
    shipping_address: IAddress;
    billing_address: IAddress;
    subtotal: number;
    discount_amount: number;
    final_amount: number;
    coupon_code?: string;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    order_status: OrderStatus;
    notes?: string;
    created_at: Date;
    updated_at: Date;
    delivered_at?: Date;
    }
}

