export interface ChatMessage {
  title: 'chat';
  data: string;
}

export interface PeerUpdateMessage {
  title: 'update-peers';
  data: string[];
}

export type Message = ChatMessage | PeerUpdateMessage;
