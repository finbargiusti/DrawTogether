import type { CanvasOptions, Cursor } from './canvas';
import Frame from './frame';
import type { Line } from './line';
import type Lobby from './lobby';
import type { FrameUpdateMessage } from './message';

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
      this.lobby.conn;
    });

    let debounce = false;

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
        if (!debounce) {
          debounce = true;

          let l: Line;

          if (!this.drawingFrame.line) {
            // this is the first point in the line
          } else {
            l = this.drawingFrame.line;
            l.points.push({ x, y });
          }

          this.drawingFrame.setLine(l);
          const m: FrameUpdateMessage = {
            title: 'frame-update',
            data: {
              id: this.drawingFrame.id,
              line: this.drawingFrame.line,
            },
          };

          this.lobby.conn.sendToAllPeers(m);

          setTimeout(() => (debounce = false), 5);
        }
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

        this.frames.push(this.drawingFrame);

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
    this.render();
  }

  renderCursors() {
    let ctx = this.canv.getContext('2d');
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

  render() {
    this.canv
      .getContext('2d')
      .clearRect(0, 0, this.canv.width, this.canv.height);
    this.renderCursors();
  }
}
