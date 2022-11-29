import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { hashName } from './hashname';
import type {
  ChatMessage,
  LobbyMessage,
  Message,
  PeerUpdateMessage,
} from './message';

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
        this.host.on('open', () => {
          this.updatePlayerList();
        });
        this.addMessageListeners(this.host);
        this.addErrorListeners(this.host);
        this.updatePlayerList();
      });
    }

    this.updatePlayerList();

    this.p.on('connection', (d) => {
      this.addPeer(d);
    });
  }

  public onMessage: (m: LobbyMessage) => void;

  private addMessageListeners(d: DataConnection) {
    d.on('open', () => {
      d.on('data', (bin) => {
        const m = bin as Message;
        if (m.title == 'update-peers') {
          this.updatePeers(m.data);
        } else {
          if (m.title == 'chat') {
            this.onMessage({ ...m, from: d.peer });
          } else {
            this.onMessage(m);
          }
        }
      });
    });
  }

  private addErrorListeners(d: DataConnection) {
    d.on('error', (er) => {
      console.error(er);
    });
  }

  private updatePeers(peerList: string[]) {
    peerList.forEach((id) => {
      if (!this.peers.map((d) => d.peer).includes(id)) {
        this.addPeer(this.p.connect(id));
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
        data: this.peers
          .map((p) => p.peer)
          .filter((id) => id != peer.peer /* name of peer connected */),
      };

      this.sendToPeer(peer, m);
    });
  }

  public onNewPeer: (d: DataConnection) => void;

  private addPeer(d: DataConnection) {
    // delete peer obj of same name if exists

    const index = this.peers.findIndex((n) => n.peer == d.peer);

    if (index != -1) {
      this.peers.splice(index, 1);
    }

    this.peers.push(d);

    d.on('open', () => {
      this.updatePlayerList();
    });

    d.peerConnection.oniceconnectionstatechange = () => {
      if (d.peerConnection.iceConnectionState == 'disconnected') {
        setTimeout(() => {
          // TODO: make an option for this

          // closes connection if timed out for 5s
          d.close();
          this.peers.splice(this.peers.indexOf(d), 1);
          this.updatePlayerList();
        }, 5000);
      }
      this.updatePlayerList();
    };

    this.addMessageListeners(d);
    this.addErrorListeners(d);
    if (this.isHost) this.propogatePeerInfo();

    // notify peer update
    this.updatePlayerList();
    this.onNewPeer(d);
  }

  public sendToPeer(d: DataConnection, m: Message) {
    if (d.open) {
      d.send(m);
    } else {
      d.on('open', () => this.sendToPeer(d, m)); // retry when open
    }
  }

  public sendToAllPeers(m: Message) {
    if (!this.isHost) {
      this.host.send(m);
    }

    this.peers.forEach((p) => {
      console.log(p.peer, m);
      this.sendToPeer(p, m);
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
        active: this.host.peerConnection.iceConnectionState == 'connected',
        host: true,
        you: false,
      });
    }

    list = [
      ...list,
      ...this.peers.map((d) => ({
        id: d.peer,
        active: d.peerConnection.iceConnectionState == 'connected',
        you: false,
        host: false,
      })),
    ];
    this.onPlayerListUpdate(list);
  }
}
