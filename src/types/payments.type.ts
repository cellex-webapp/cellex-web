declare global {
    interface IPayment {
        _id: string;
        order_id: string;
        transaction_id: string;
        payment_method: PaymentMethod;
        amount: number;
        currency: string;
        status: PaymentStatus;
        gateway_response: Record<string, any>;
        fee_amount: number;
        created_at: Date;
        updated_at: Date;
        completed_at?: Date;
    }
}