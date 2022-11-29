import type { CanvasOptions, Cursor } from './canvas';
import type Connection from './connection';

export default class Painting {
  canv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  conn: Connection;

  options: CanvasOptions;

  cursors: { [id: string]: Cursor } = {};

  constructor(
    canv: HTMLCanvasElement,
    options: CanvasOptions,
    conn: Connection
  ) {
    this.canv = canv;
    this.ctx = canv.getContext('2d');

    this.options = options;
    this.conn = conn;

    this.addMouseMoveListener();
  }

  addMouseMoveListener() {
    this.canv.addEventListener('mousemove', (ev) => {
      const r = this.canv.getBoundingClientRect();

      // get relative position

      const x = ev.pageX - r.x;
      const y = ev.pageY - r.y;

      this.updateCursor({
        username: 'you',
        x: x,
        y: y,
      });

      this.conn.sendToAllPeers({
        title: 'cursor-move',
        data: { username: this.conn.p.id, x: x, y: y },
      });
    });

    this.canv.addEventListener('mouseleave', (ev) => {
      this.updateCursor({
        username: 'you',
        x: -20,
        y: -20,
      }); // hacky way to hide the cursor for all

      this.conn.sendToAllPeers({
        title: 'cursor-move',
        data: { username: this.conn.p.id, x: -20, y: -20 },
      });
    });
  }

  updateCursor(c: Cursor) {
    // own cursor name is "you"
    this.cursors[c.username] = c;
    this.render();
  }

  renderCursors() {
    Object.keys(this.cursors).forEach((name) => {
      const c = this.cursors[name];

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, 5, 0, 2 * Math.PI);
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fill();
      this.ctx.font = '12px serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(name.substring(0, 6), c.x, c.y - 20);
      this.ctx.restore();
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.canv.width, this.canv.height);
    this.renderCursors();
  }
}
