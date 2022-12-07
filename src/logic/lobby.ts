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
import Painting from './painting';

export default class Lobby {
  // id is equal to the peer id of the "host" peer when hasheod
  public hostId: string;

  public conn: Connection;

  public canvas: HTMLCanvasElement;

  public painting: Painting;

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

  public createPainting(options: CanvasOptions) {
    if (!this.canvas) {
      throw new Error('Canvas not found!');
    }
    this.painting = new Painting(this.canvas, options, this);
  }

  private listeners: {
    [K in LobbyMessage['title']]?: (m: LobbyMessage) => void;
  } = {};

  public on(ev: LobbyMessage['title'], callback: (m: LobbyMessage) => void) {
    this.listeners[ev] = callback;
  }

  public addMessageListener() {
    this.conn.onMessage = (m) => {
      if (m.title == 'canvas-definition') {
        const c = m.data as CanvasOptions;
        this.createPainting(c);
      }

      if (m.title == 'cursor-move') {
        const c = m.data as Cursor;
        this.painting.updateCursor(c);
      }

      if (m.title == 'frame-update') {
        const i = this.painting.frames.findIndex(
          (f) => f.id == m.data.id && m.from == f.owner
        );

        if (i == -1) {
          const f = new Frame(this.canvas.parentElement, this.painting.options);
          f.setLine(m.data.line);
          this.painting.frames.push(f);
        } else {
          this.painting.frames[i].setLine(m.data.line);
        }
      }

      // call related callback (1 per message type)
      if (this.listeners[m.title]) this.listeners[m.title](m);
    };

    this.conn.onNewPeer = (p) => {
      if (this.painting.options && this.conn.isHost) {
        p.on('open', () => {
          // when this peer is open,
          // send on our canvas definition
          this.conn.sendToPeer(p, {
            title: 'canvas-definition',
            data: this.painting.options,
          });
        });
      }
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
