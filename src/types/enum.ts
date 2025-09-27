declare global {
    type UserRole = "ADMIN" | "VENDOR" | "CLIENT";
    type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
    type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
    type MessageType = "TEXT" | "IMAGE" | "FILE";
    type NotificationType = "PROMOTION" | "ORDER_STATUS" | "SYSTEM" | "REVIEW" | "CHAT";
    type InventoryLogType = "IMPORT" | "SALE" | "ADJUSTMENT" | "RETURN";
    type CouponType = "DAILY" | "MONTHLY" | "BIRTHDAY" | "ANNIVERSARY" | "SPECIAL_EVENT";
    type CouponStatus = "ACTIVE" | "EXPIRED" | "USED";
    type PaymentMethod = "COD" | "VNPAY" | "MOMO" | "BANK_TRANSFER";
    type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPING" | "DELIVERED" | "CANCELLED";
}

 