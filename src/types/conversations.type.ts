declare global {
    interface IConversation {
        _id: string;
        participants: string[];
        last_message: string;
        last_message_at: Date;
        unread_count: Record<string, number>;
        created_at: Date;
        updated_at: Date;
    }
}