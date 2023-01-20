import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { writable } from 'svelte/store';
import { hashName } from './hashname';
import type { Message, MessageData, MessageTitle } from './message';
import { Node, type MessageListener } from './node';

export class Connection {
  isHost: boolean;
  self: Peer;
  open = false;

  lobbyID: string;

  nodes: Node[] = [];

  addNode(d: DataConnection) {
    const n = new Node(d, this.onMessage, this.updatePlayerList);

    this.nodes.push(n);

    this.updatePlayerList();

    n.onOpen(() => {
      this.onMessage('new-peer', n, null);
    });
  }

  constructor(id: string, host: boolean) {
    this.lobbyID = id;

    this.self = new Peer(host ? hashName(id) : undefined);

    this.isHost = host;

    this.addListeners();

    if (!host) {
      this.self.on('open', () => {
        this.connectTo(hashName(id));
      });
    }

    this.updatePlayerList();
  }

  addListeners() {
    // When our peer opens
    this.self.on('open', () => {
      this.open = true;
      this.updatePlayerList();
    });

    // When we get a new peer
    this.self.on('connection', (dc) => {
      this.addNode(dc);
    });

    this.addDefaultMessageListeners();
  }

  connectTo(id: string) {
    this.addNode(this.self.connect(id));
  }

  sendToAll<T extends MessageTitle>(title: T, data: MessageData<T>) {
    this.nodes.forEach((n) => {
      n.send(title, data);
    });
  }

  sendToPeer<T extends MessageTitle>(p: Node, title: T, data: MessageData<T>) {
    p.send(title, data);
  }

  listeners: {
    title: MessageTitle;
    callback: (data: MessageData<MessageTitle>, from: string) => void;
  }[] = [];

  onMessage: MessageListener = (
    title: MessageTitle,
    data: MessageData<MessageTitle>,
    from: string
  ) => {
    this.listeners
      .filter((l) => l.title == title)
      .forEach((l) => {
        l.callback(data, from);
      });
  };

  on<T extends MessageTitle>(
    title: T,
    callback: (data: MessageData<T>, from: string) => void
  ) {
    this.listeners.push({
      title,
      callback,
    });
  }

  addDefaultMessageListeners() {
    if (this.isHost) {
      this.on('new-peer', (n) => {
        this.sendToAll('update-peer', n.net.peer);
      });
    } else {
      this.on('update-peer', (id) => {
        if (id != this.self.id) {
          this.connectTo(id);
        }
      });
    }
  }

  playerlist = writable<{ id: string; active: boolean }[]>([]);

  updatePlayerList = () => {
    const others = this.nodes.map((n) => ({
      id: n.net.peer,
      active: n.open,
    }));

    const list = [{ id: this.self.id, active: this.self.open }, ...others];

    this.playerlist.set(list);
  };
}
