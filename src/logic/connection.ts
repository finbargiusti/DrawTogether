import Peer from 'peerjs';
import type {DataConnection} from 'peerjs';
import {hashName} from './hashname';
import {type MessageData, toMessageObject, type SentMessageTitle, type MessageTitle, isMessageObject, type FrameData} from './message';
import EventEmitter from 'events';


// interface for typescript disallowing wrong data input
export interface MessageEmitter {
  on<T extends MessageTitle>(
      title: T, listener: (data: MessageData<T>, from?: string) => void): this;
  once<T extends MessageTitle>(
      title: T, listener: (data: MessageData<T>, from?: string) => void): this;
  emit<T extends MessageTitle>(title: T, data: MessageData<T>, from?: string):
      boolean;
}

export class MessageEmitter extends EventEmitter {}

/**
 *
 * Wrapper EventEmitter which can signal and send messages between peers.
 *
 */
export class Connection extends MessageEmitter {
  isHost: boolean;

  peerConnection: Peer;

  open = false;

  lobbyID: string;

  nodes: DataConnection[] = [];

  framesSinceInception: FrameData[] = [];

  chatsSinceInception: (MessageData<'chat'>&{from: string})[] = [];

  addNode(d: DataConnection) {
    this.nodes.push(d);

    // add all node listeners

    // These are all TOP-LEVEl and will be called before any added after
    // addition to the array.

    this.emit('new-peer', d);

    d.on('close', () => {
      // connection is voluntarily closed.
      this.nodes = this.nodes.filter(dc => dc != d);
    })

    d.on(
        'error',
        (err) => {
            // TODO: handle connection error here
        })

    d.on('iceStateChanged', (ice) => {
      console.log(`Connection state for ${d.peer}: ${ice.toString()}`);
    })

    d.on('data', (res: unknown) => {
      if (!isMessageObject(res)) return;  // nope out if bad data

      this.emit(res.title, res.data, d.peer);
    })
  }

  constructor(id: string, host: boolean) {
    super();

    this.lobbyID = id;

    this.peerConnection = new Peer(host ? hashName(id) : undefined);

    this.isHost = host;

    this.addListeners();

    if (!host) {
      this.peerConnection.on('open', () => {
        this.connectTo(hashName(id));
      });
    }
  }

  addListeners() {
    // When our peer opens
    this.peerConnection.on('open', () => {
      this.open = true;
    });

    // When we get a new peer
    this.peerConnection.on('connection', dc => {
      this.addNode(dc);
    });

    this.addDefaultMessageListeners();
  }

  /**
  * Connect to a peer.
  */
  connectTo(id: string) {
    this.addNode(this.peerConnection.connect(id));
  }

  sendToAll<T extends SentMessageTitle>(
      title: T, data: MessageData<T>, includeSelf?: true) {
    this.nodes.forEach(n => {
      this.sendToPeer(n, title, data);
    });
    if (includeSelf) {
      this.emit(title, data, this.peerConnection.id);
    }
  }

  sendToPeer<T extends SentMessageTitle>(
      dc: DataConnection, title: T, data: MessageData<T>) {
    dc.send(toMessageObject(title, data));
  }

  /**
  * Send all frames and chats since inception to a given peer.
  */
  catchUp(dc: DataConnection) {
    this.chatsSinceInception.forEach(cd => {
      this.sendToPeer(dc, 'chat', cd);
    });
    this.framesSinceInception.forEach(
        fd => this.sendToPeer(dc, 'frame-update', fd));
  }

  addDefaultMessageListeners() {
    if (this.isHost) {
      this.on('frame-update', fd => {
        this.framesSinceInception.push(fd);
      });
      this.on('chat', (cd, from) => {
        this.chatsSinceInception.push({
          ...cd,
          from,
        });
      });
    } else {
      this.on('update-peer', id => {
        if (id != this.peerConnection.id) {
          this.connectTo(id);
        }
      });
    }
  }
}
