import type { DataConnection } from 'peerjs';
import {
  toMessageObject,
  type Message,
  type MessageData,
  type MessageObject,
  type MessageTitle,
} from './message';

export type MessageListener = (
  title: MessageTitle,
  m: MessageData<MessageTitle>,
  from: string
) => void;

/**
 * Websocket wrapper
 */
export class Node {
  net: DataConnection;
  onMessage: MessageListener;
  onStateChange: () => void;
  open = false;

  /**
   * @param connection
   * @param host
   */
  constructor(
    connection: DataConnection,
    onMessage: MessageListener,
    onStateChange: () => void
  ) {
    this.net = connection;
    this.onMessage = onMessage;
    this.onStateChange = onStateChange;

    this.addHandlers();
  }

  onOpen(callback: () => void) {
    this.net.on('open', callback);
  }

  addHandlers() {
    this.net.on('open', () => {
      this.open = true;
      this.onStateChange();
    });
    this.net.on('iceStateChanged', (state) => {
      // TODO: peer connection dropping
    });
    this.net.on('close', () => {
      this.open = false;
      this.onStateChange();
    });
    this.net.on('error', (e) => {
      console.error(e, e.stack);
    });
    this.net.on('data', (d: MessageObject<MessageTitle>) => {
      this.onMessage(d.title, d.data, this.net.peer);
    });
  }

  send<T extends MessageTitle>(title: T, data: MessageData<T>) {
    this.net.send(toMessageObject(title, data));
  }
}
