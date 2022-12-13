import type { DataConnection } from 'peerjs';
import type { CanvasOptions, Cursor } from './canvas';
import Connection from './connection';
import Frame from './frame';
import type {
  CanvasDefinitionMessage,
  ChatMessage,
  CursorUpdateMessage,
  FrameUpdateMessage,
  LobbyMessage,
} from './message';

import type Painting from './painting';

export default class Lobby {
  // id is equal to the peer id of the "host" peer when hasheod
  public hostId: string;

  public conn: Connection;

  constructor(id?: string) {
    if (!id) {
      this.hostId = Math.random().toString(36).substring(2, 8);

      this.conn = new Connection({
        id: this.hostId,
        host: true,
      });
    } else {
      this.hostId = id;

      this.conn = new Connection({
        id: this.hostId,
        host: false,
      });
    }

    this.addMessageListener();
  }

  private messageListeners: {
    [K in LobbyMessage['title']]?: (m: LobbyMessage) => void;
  } = {};

  public on(ev: LobbyMessage['title'], callback: (m: LobbyMessage) => void) {
    this.messageListeners[ev] = callback;
  }

  private newPeerListeners: ((p: DataConnection) => void)[] = [];

  public onNewPeer(callback: (p: DataConnection) => void) {
    this.newPeerListeners.push(callback);
  }

  public addMessageListener() {
    this.conn.onMessage = (m) => {
      // call related callback (1 per message type)
      if (this.messageListeners[m.title]) this.messageListeners[m.title](m);
    };

    this.conn.onNewPeer = (p) => {
      p.on('open', () => {
        this.newPeerListeners.forEach((l) => {
          l(p);
        });
      });
    };
  }

  public sendChat(chat: string) {
    const m: ChatMessage = {
      title: 'chat',
      data: chat,
    };

    this.conn.sendToAllPeers(m);
  }
}
