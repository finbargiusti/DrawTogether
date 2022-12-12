import type { CanvasOptions, Cursor } from './canvas';
import Frame from './frame';
import type { Line } from './line';
import type Lobby from './lobby';
import type { FrameUpdateMessage } from './message';

const MAX_FRAME_LEN = 5;

export default class Painting {
  canv: HTMLCanvasElement;
  lobby: Lobby;

  options: CanvasOptions;

  frames: Frame[] = [];

  drawingFrame: Frame;

  currentColor: `#${string}`;

  cursors: { [id: string]: Cursor } = {};

  constructor(canv: HTMLCanvasElement, options: CanvasOptions, lobby: Lobby) {
    this.canv = canv;

    this.options = options;

    this.lobby = lobby;

    this.addMouseListeners();
  }

  addMouseListeners() {
    this.canv.addEventListener('mousedown', (ev) => {
      const r = this.canv.getBoundingClientRect();

      // get relative position

      const x = ev.pageX - r.x;
      const y = ev.pageY - r.y;

      this.drawingFrame = new Frame(this.canv.parentElement, this.options);
      this.drawingFrame.setLine({
        color: this.currentColor,
        points: [{ x, y }],
        width: 5,
      });
      this.propogateDrawUpdate();
    });

    this.canv.addEventListener('mousemove', (ev) => {
      const r = this.canv.getBoundingClientRect();

      // get relative position

      const x = ev.pageX - r.x;
      const y = ev.pageY - r.y;

      this.updateCursor({
        username: 'you',
        x,
        y,
      });

      this.lobby.conn.sendToAllPeers({
        title: 'cursor-move',
        data: { username: this.lobby.conn.p.id, x: x, y: y },
      });
      if (this.drawingFrame) {
        // we are currently drawing

        let l: Line;

        l = this.drawingFrame.line;
        l.points.push({ x, y });

        this.drawingFrame.setLine(l);

        this.propogateDrawUpdate();
      }
    });

    let finishFrame = (ev: MouseEvent) => {
      if (this.drawingFrame && this.drawingFrame.line) {
        const r = this.canv.getBoundingClientRect();

        // get relative position

        const x = ev.pageX - r.x;
        const y = ev.pageY - r.y;

        let l = this.drawingFrame.line;

        l.points.push({ x, y });

        this.drawingFrame.setLine(l);

        this.addFrame(this.drawingFrame);

        this.drawingFrame = undefined;
      }
    };

    this.canv.addEventListener('mouseup', finishFrame);

    this.canv.addEventListener('mouseleave', (ev) => {
      this.updateCursor({
        username: 'you',
        x: -20,
        y: -20,
      }); // hacky way to hide the cursor for all

      this.lobby.conn.sendToAllPeers({
        title: 'cursor-move',
        data: { username: this.lobby.conn.p.id, x: -20, y: -20 },
      });

      finishFrame(ev);
    });
  }

  propogateDrawUpdate() {
    const m: FrameUpdateMessage = {
      title: 'frame-update',
      data: {
        id: this.drawingFrame.id,
        line: this.drawingFrame.line,
      },
    };

    this.lobby.conn.sendToAllPeers(m);
  }

  addFrameUpdateListener() {
    this.lobby.on('frame-update', (m) => {
      const f = m as FrameUpdateMessage;
      this.frames
        .find((v) => {
          v.owner == m.from && v.id == f.data.id;
        })
        .setLine(f.data.line);
    });
  }

  updateCursor(c: Cursor) {
    // own cursor name is "you"
    this.cursors[c.username] = c;
    this.renderCursors();
  }

  renderCursors() {
    let ctx = this.lobby.mouseCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.options.width, this.options.height);
    Object.keys(this.cursors).forEach((name) => {
      const c = this.cursors[name];

      ctx.save();
      ctx.beginPath();
      ctx.arc(c.x, c.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.fillText(name.substring(0, 6), c.x, c.y - 20);
      ctx.restore();
    });
  }

  // adds a frame to the currently drawing frame stack
  addFrame(f: Frame) {
    this.frames.push(f);
    if (this.frames.length > MAX_FRAME_LEN) {
      const oldFrame = this.frames.shift();
      this.mergeToCanvas(oldFrame);
    }
  }

  // Consolidates last frame to the main canvas, to reduce lag
  mergeToCanvas(f: Frame) {
    // TODO: Better way to do this?
    f.canv.toBlob((blob) => {
      f.destroy();
      console.log(f.canv);
      createImageBitmap(blob).then((img) => {
        this.canv.getContext('2d').drawImage(img, 0, 0);
      });
    });
  }
}
