export interface User {
  email: string;
  name: string;
  avatar?: string;
}

export interface Message {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image';
}

export interface Contact {
  email: string;
  name: string;
  lastMessage?: Message;
  unreadCount: number;
  isAi?: boolean;
}

export const AI_USER_EMAIL = 'gemini@ai.bot';
export const AI_USER_NAME = 'Gemini AI Assistant';