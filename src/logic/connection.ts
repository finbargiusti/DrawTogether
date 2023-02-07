import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { writable } from 'svelte/store';
import { hashName } from './hashname';
import type { Message, MessageData, MessageTitle } from './message';
import { Node, type MessageListener } from './node';
import type { Line } from './line';
import type { FrameData } from '../lib/Painting.svelte';

export class Connection {
  isHost: boolean;
  self: Peer;
  open = false;

  lobbyID: string;

  nodes: Node[] = [];

  framesSinceInception: FrameData[] = [];

  chatsSinceInception: (MessageData<'chat'> & { from: string })[] = [];

  addNode(d: DataConnection) {
    const n = new Node(d, this.propogateMessage, this.updatePlayerList);

    this.nodes.push(n);

    this.updatePlayerList();

    n.onOpen(() => {
      this.propogateMessage('new-peer', n, null);
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

  sendToAll<T extends MessageTitle>(
    title: T,
    data: MessageData<T>,
    includeSelf?: true
  ) {
    this.nodes.forEach((n) => {
      this.sendToPeer(n, title, data);
    });
    if (includeSelf) {
      this.propogateToSelf(title, data);
    }
  }

  sendToPeer<T extends MessageTitle>(p: Node, title: T, data: MessageData<T>) {
    p.send(title, data);
  }

  listeners: {
    title: MessageTitle;
    callback: (data: MessageData<MessageTitle>, from: string) => void;
  }[] = [];

  // When message arrives, is parsed through here
  propogateMessage = <T extends MessageTitle>(
    title: T,
    data: MessageData<T>,
    from: string
  ) => {
    // This can only exist as lambda function since we need _this_ "this"
    // (as in the Connection object to be in context.)

    this.listeners
      .filter((l) => l.title == title)
      .forEach((l) => {
        l.callback(data, from);
      });
  };

  /**
   *
   * Send server message to self, used for consitency between alien peer calls
   * and self peer calls, to avoid code copying, and logging.
   *
   */
  propogateToSelf = <T extends MessageTitle>(
    title: T,
    data: MessageData<T>
  ) => {
    this.propogateMessage(title, data, this.self.id);
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
        // catch-up peer for frames
        this.chatsSinceInception.forEach((cd) => {
          this.sendToPeer(n, 'chat', cd);
        });
        this.framesSinceInception.forEach((fd) =>
          this.sendToPeer(n, 'frame-update', fd)
        );
      });
      this.on('frame-update', (fd) => {
        this.framesSinceInception.push(fd);
      });
      this.on('chat', (cd, from) => {
        this.chatsSinceInception.push({
          ...cd,
          from,
        });
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
