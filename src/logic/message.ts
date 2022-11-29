import type { CanvasOptions } from './canvas';

export interface ChatMessage {
  title: 'chat';
  data: string;
}

export interface PeerUpdateMessage {
  title: 'update-peers';
  data: string[];
}

export interface CanvasDefinitionMessage {
  title: 'canvas-definition';
  data: CanvasOptions;
}

export type Message = ChatMessage | PeerUpdateMessage | CanvasDefinitionMessage;

export type LobbyMessage =
  | (ChatMessage & { from: string })
  | CanvasDefinitionMessage;
