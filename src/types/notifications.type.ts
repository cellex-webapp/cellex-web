declare global {
    interface INotification {
        _id: string;
        recipient_id: string;
        sender_id?: string;
        title: string;
        message: string;
        type: NotificationType;
        is_read: boolean;
        expires_at?: Date;
        created_at: Date;
        read_at?: Date;
    }
}