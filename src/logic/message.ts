import type {CanvasOptions} from './canvas';
import {isObject} from './dtr';
import type {DataConnection} from 'peerjs';
import type {Line, LineOpts} from './line';

export type FrameData = {
  id: string; line: Line;
};

export type CursorMoveMessage = {
  pos: {x: number; y: number}; opts: LineOpts;
}

export type Message = {
  chat: {
    text: string; time: number;
    from?: string
  };  // from override when coming from host
  'new-peer': DataConnection;
  'update-peer': string;
  'canvas-definition': CanvasOptions;
  'cursor-move': CursorMoveMessage;
  'frame-update': FrameData;
};

export type MessageTitle = keyof Message;


export type MessageData<T extends MessageTitle> = Message[T];

export type SentMessageTitle = Exclude<MessageTitle, 'new-peer'>

    export function isSentMessageTitle(tit: unknown):
        tit is SentMessageTitle {
          if (typeof tit != 'string') return false;

          if (!['chat', 'update-peer', 'canvas-definition', 'cursor-move',
                'frame-update']
                   .includes(tit))
            return false;

          return true;
        }

export type MessageObject<T extends SentMessageTitle> = {
  title: T; data: MessageData<T>;
};

/**
 * Creates a sendable object containing all message data
 *
 *  TODO: improve with compression maybe?
 */

export function toMessageObject<T extends SentMessageTitle>(
    title: T, data: MessageData<T>): MessageObject<T> {
  return {
    title,
    data,
  };
}

export function isMessageObject(data: unknown):
    data is MessageObject<SentMessageTitle> {
  if (!isObject(data)) return false;

  if (!('title' in data)) return false;

  if (!('data' in data)) return false;

  if (!isSentMessageTitle(data.title)) return false;

  // we will assume at this point that the data is valid. This should change,
  // but is hard and expensive. So far we haven't encountered any error with
  // peerjs so this shouldn't be a problem.

  return true;
}
