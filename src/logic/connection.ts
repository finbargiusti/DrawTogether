import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { hashName } from './hashname';
import type { ChatMessage, Message, PeerUpdateMessage } from './message';

export type LobbyMessage = ChatMessage;

export default class Connection {
  isHost: boolean;
  p: Peer;
  host?: DataConnection;
  peers: DataConnection[] = [];

  public playerlist: { id: string; active: boolean }[] = [];

  constructor({ host, id }: { host: boolean; id: string }) {
    if (host) {
      // id is desired id for this peer
      this.isHost = true;

      this.p = new Peer(hashName(id));

      this.p.on('open', (id) => {
        this.updatePlayerList();
      });

      this.host = undefined;
    } else {
      // id is id of host for this lobby

      this.isHost = false;

      this.p = new Peer();

      this.p.on('open', () => {
        this.host = this.p.connect(hashName(id));
        this.addMessageListeners(this.host);
        this.updatePlayerList();
      });
    }

    this.updatePlayerList();

    this.p.on('connection', (d) => {
      this.addPeer(d);
      this.addMessageListeners(d);
      if (this.isHost) this.propogatePeerInfo();
    });
  }

  public onMessage: (m: LobbyMessage) => void;

  private addMessageListeners(d: DataConnection) {
    d.on('open', () => {
      d.on('data', (bin) => {
        const m = bin as Message;
        if (m.title == 'update-peers') {
          console.log(m.data);
          this.updatePeers(m.data);
        } else {
          this.onMessage(m);
        }
      });
    });
  }

  private updatePeers(peerList: string[]) {
    peerList.forEach((id) => {
      if (!this.peers.map((d) => d.peer).includes(id)) {
        this.peers.push(this.p.connect('d'));
        this.updatePlayerList();
      }
    });
  }

  private propogatePeerInfo() {
    if (!this.isHost) {
      return; // guard but should never happen
    }

    this.peers.forEach((peer) => {
      const m: PeerUpdateMessage = {
        title: 'update-peers',
        data: this.peers.map((p) => p.peer),
      };

      peer.send(m);
    });
  }

  private addPeer(d: DataConnection) {
    // delete peer obj of same name if exists

    const index = this.peers.findIndex((n) => n.peer == d.peer);

    if (index != -1) {
      this.peers.splice(index, 1);
    }

    this.peers.push(d);

    // notify peer update
    this.updatePlayerList();
  }

  public sendToAllPeers(m: Message) {
    if (!this.isHost) {
      this.host.send(m);
    }

    this.peers.forEach((p) => {
      if (p.open) p.send(m);
    });
  }

  public onPlayerListUpdate: (
    l: { id: string; active: boolean; you: boolean; host: boolean }[]
  ) => void = () => {};

  private updatePlayerList() {
    if (!this.p.open) {
      this.onPlayerListUpdate([
        {
          id: 'loading..',
          active: false,
          you: true,
          host: this.isHost,
        },
      ]);
      return;
    }

    let list: { id: string; active: boolean; you: boolean; host: boolean }[] =
      [];

    if (this.isHost) {
      list.push({
        id: this.p.id,
        active: true,
        host: true,
        you: true,
      });
    } else {
      list.push({ id: this.p.id, active: true, you: true, host: false });
      list.push({
        id: this.host.peer,
        active: this.host.open,
        host: true,
        you: false,
      });
    }

    list = [
      ...list,
      ...this.peers.map((d) => ({
        id: d.peer.substring(0, 5),
        active: d.open,
        you: false,
        host: false,
      })),
    ];
    this.onPlayerListUpdate(list);
  }
}
