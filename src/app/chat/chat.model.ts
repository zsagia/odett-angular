/**
 * Chat üzenet típusok
 */
export type MessageType = 'chat' | 'join' | 'leave' | 'system' | 'users';

/**
 * Chat üzenet interfész
 */
export interface ChatMessage {
  type: MessageType;
  username: string;
  content: string;
  timestamp: number;
}

/**
 * Online felhasználók üzenet
 */
export interface UsersMessage {
  type: 'users';
  users: string[];
  timestamp: number;
}

/**
 * WebSocket üzenet (union type)
 */
export type WebSocketMessage = ChatMessage | UsersMessage;

/**
 * Kapcsolat állapota
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
