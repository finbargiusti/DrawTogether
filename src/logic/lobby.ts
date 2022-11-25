import Connection, { type LobbyMessage } from './connection';
import type { ChatMessage } from './message';

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

  public onMessage: (m: LobbyMessage) => void = (m) => alert(m.data);

  public addMessageListener() {
    this.conn.onMessage = (m) => {
      this.onMessage(m);
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
