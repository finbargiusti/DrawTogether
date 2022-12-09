import type { CanvasOptions, Cursor } from './canvas';
import type { Line } from './line';

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

export interface FrameUpdateMessage {
  title: 'frame-update';
  data: {
    id: string; // uuid
    line: Line;
  };
}

export type LobbyMessage = (
  | ChatMessage
  | CanvasDefinitionMessage
  | CursorUpdateMessage
  | FrameUpdateMessage
) & { from: string };

export type Message =
  | ChatMessage
  | PeerUpdateMessage
  | CanvasDefinitionMessage
  | CursorUpdateMessage
  | FrameUpdateMessage;
