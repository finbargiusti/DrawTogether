import type { CanvasOptions, Cursor } from './canvas';

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

export interface CursorUpdateMessage {
  title: 'cursor-move';
  data: Cursor;
}

export type LobbyMessage =
  | (ChatMessage & { from: string })
  | CanvasDefinitionMessage
  | CursorUpdateMessage;

export type Message =
  | ChatMessage
  | PeerUpdateMessage
  | CanvasDefinitionMessage
  | CursorUpdateMessage;
