import type { FrameData } from '../lib/Painting.svelte';
import type { CanvasOptions } from './canvas';
import type { Line } from './line';
import type { Node } from './node';

export type FrameData = {
  id: string;
  line: Line;
};

export type Message = {
  chat: { text: string; time: number; from?: string }; // from override when coming from host
  'new-peer': Node;
  'update-peer': string;
  'canvas-definition': CanvasOptions;
  'cursor-move': { x: number; y: number };
  'frame-update': FrameData;
};

export type MessageTitle = keyof Message;

export type MessageData<T extends MessageTitle> = Message[T];

export type MessageObject<T extends MessageTitle> = {
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

type MessageQueueListener<T extends MessageTitle> = (
  data: MessageData<T>,
  from?: string
) => Promise<void> | void;

export class MessageQueue<T extends MessageTitle> {
  constructor(callback: MessageQueueListener<T>) {
    this.callback = callback;
    this.flush();
  }

  queue: { data: MessageData<T>; from?: string }[] = [];

  callback: MessageQueueListener<T> = undefined;

  flushing = false;

  open = false;

  ready = () => {
    this.open = true;
    this.flush();
  };

  flush() {
    if (this.queue.length == 0 || this.flushing || !this.open) return;

    const { data, from } = this.queue[0];

    Promise.resolve(this.callback(data, from)).then(() => {
      this.queue.shift();
      this.flushing = false;
      this.flush();
    });
  }

  add = (data: MessageData<T>, from?: string) => {
    this.queue.push({ data, from });
    this.flush();
  };
}
