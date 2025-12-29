// Minimal STOMP WebSocket client for chat realtime (Admin-first)
// Note: Requires packages: @stomp/stompjs and sockjs-client
// Falls back gracefully if env/config is missing

import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

type ChatEvent = {
  eventType: 'NEW_MESSAGE' | 'MESSAGE_READ' | 'TYPING';
  chatRoomId: string;
  senderId: string;
  timestamp: number;
  data?: any;
};

type MessageHandler = (evt: ChatEvent) => void;

const deriveWsUrl = (): string | null => {
  const api = (import.meta.env as any)?.VITE_API_BASE_URL as string | undefined;
  const explicit = (import.meta.env as any)?.VITE_WS_URL as string | undefined;
  if (explicit) return explicit;
  if (!api) return null;
  try {
    const u = new URL(api);
    const protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
    // Backend uses "/ws" SockJS endpoint
    return `${protocol}//${u.host}/ws`;
  } catch {
    return null;
  }
};

class WebSocketService {
  private client: Client | null = null;
  private userQueueSubId: string | null = null;
  private roomSubs: Map<string, string> = new Map();
  private onEvent: MessageHandler | null = null;

  connect(onEvent: MessageHandler) {
    const wsUrl = deriveWsUrl();
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : undefined;
    this.onEvent = onEvent;

    if (!wsUrl) {
      console.warn('[ws] No WS URL configured. Skipping connect.');
      return;
    }

    const client = new Client({
      // Use SockJS for better compatibility
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: () => { /* console.log('[ws]', str); */ },
      reconnectDelay: 3000,
    });

    client.onConnect = () => {
      // Subscribe to user-specific queue for direct messages
      this.subscribeUserQueue();
    };

    client.onStompError = (frame: any) => {
      console.error('[ws] STOMP error', frame.headers['message'], frame.body);
    };

    client.activate();
    this.client = client;
  }

  disconnect() {
    if (this.client) {
      try {
        if (this.userQueueSubId) {
          this.client.unsubscribe(this.userQueueSubId);
          this.userQueueSubId = null;
        }
        for (const [, subId] of this.roomSubs.entries()) {
          this.client.unsubscribe(subId);
        }
        this.roomSubs.clear();
        this.client.deactivate();
      } catch (e) {
        console.warn('[ws] Error during disconnect', e);
      } finally {
        this.client = null;
      }
    }
  }

  private handleMessage = (message: IMessage) => {
    try {
      const body = message.body ? JSON.parse(message.body) : null;
      if (!body || !this.onEvent) return;
      // Normalize to ChatEvent per README
      const evt: ChatEvent = {
        eventType: body.eventType,
        chatRoomId: body.chatRoomId,
        senderId: body.senderId,
        timestamp: body.timestamp,
        data: body.data,
      };
      this.onEvent(evt);
    } catch (e) {
      console.warn('[ws] Failed to parse message', e);
    }
  };

  private subscribeUserQueue() {
    if (!this.client) return;
    if (this.userQueueSubId) return;
    const sub = this.client.subscribe('/user/queue/messages', this.handleMessage);
    this.userQueueSubId = sub.id;
  }

  subscribeRoom(roomId: string) {
    if (!this.client || !roomId || this.roomSubs.has(roomId)) return;
    const sub = this.client.subscribe(`/topic/chat/${roomId}`, this.handleMessage);
    this.roomSubs.set(roomId, sub.id);
  }

  unsubscribeRoom(roomId: string) {
    if (!this.client) return;
    const subId = this.roomSubs.get(roomId);
    if (subId) {
      this.client.unsubscribe(subId);
      this.roomSubs.delete(roomId);
    }
  }
}

export const wsService = new WebSocketService();
