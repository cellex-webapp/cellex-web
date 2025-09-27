declare global {
    interface IMessage {
        _id: string;
        conversation_id: string;
        sender_id: string;
        content: string;
        type: MessageType;
        attachment_url?: string;
        is_read: string[];
        reply_to?: string;
        created_at: Date;
        updated_at: Date;
    }
}