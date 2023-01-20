import type { CanvasOptions } from './canvas';
import type { Line } from './line';
import type { Node } from './node';

export type Message = {
  chat: string;
  'new-peer': Node;
  'update-peer': string;
  'canvas-definition': CanvasOptions;
  'cursor-move': { x: number; y: number };
  'frame-update': { id: string; line: Line };
};

export type MessageTitle = keyof Message;

export type MessageData<T extends keyof Message> = Message[T];

export type MessageObject<T extends keyof Message> = {
  title: T;
  data: MessageData<T>;
};

export function toMessageObject<T extends MessageTitle>(
  title: T,
  data: MessageData<T>
): MessageObject<T> {
  return {
    title,
    data,
  };
}
