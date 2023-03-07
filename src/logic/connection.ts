import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { hashName } from './hashname';
import { type MessageData, MessageEmitter, toMessageObject, type SentMessageTitle, isMessageObject } from './message';
import type { FrameData } from '../lib/Painting';

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

  chatsSinceInception: (MessageData<'chat'> & { from: string })[] = [];

  addNode(d: DataConnection) {
    this.nodes.push(d);

    // add all node listeners

    // These are all TOP-LEVEl and will be called before any added after addition to the array.

    this.emit('new-peer', d);

    d.on('close', () => {
      // connection is voluntarily closed.
      this.nodes = this.nodes.filter(dc => dc != d);
    })

    d.on('error', (err) => {
      // TODO: handle connection error here
    })

    d.on("iceStateChanged", (ice) => {
      console.log(`Connection state for ${d.peer}: ${ice.toString()}`);
    })

    d.on('data', (res: unknown) => {
      if (!isMessageObject(res)) return; // nope out if bad data

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

  connectTo(id: string) {
    this.addNode(this.peerConnection.connect(id));
  }

  sendToAll<T extends SentMessageTitle>(
    title: T,
    data: MessageData<T>,
    includeSelf?: true
  ) {
    this.nodes.forEach(n => {
      this.sendToPeer(n, title, data);
    });
    if (includeSelf) {
      this.emit(title, data, this.peerConnection.id);
    }
  }

  sendToPeer<T extends SentMessageTitle>(dc: DataConnection, title: T, data: MessageData<T>) {
    console.log(title);
    dc.send(toMessageObject(title, data));
  }

  addDefaultMessageListeners() {
    if (this.isHost) {
      this.on('new-peer', dc => {
        this.sendToAll('update-peer', dc.peer);
        // catch-up peer for frames
        this.chatsSinceInception.forEach(cd => {
          this.sendToPeer(dc, 'chat', cd);
        });
        this.framesSinceInception.forEach(fd =>
          this.sendToPeer(dc, 'frame-update', fd)
        );
      });
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
