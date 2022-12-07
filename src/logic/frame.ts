import type { CanvasOptions } from './canvas';
import type { Line } from './line';

/**
 * A frame represents one continuous line drawn by any user
 *
 * @class
 */

let since_creation = 0;

export default class Frame {
  id: number;
  owner: string;

  canv: HTMLCanvasElement;

  line: Line;

  constructor(parent: HTMLElement, options: CanvasOptions) {
    this.canv = document.createElement('canvas');

    this.id = ++since_creation;

    this.canv.height = options.height;
    this.canv.width = options.width;

    this.canv.style.marginTop = `-${options.height}px`;
    this.canv.style.display = 'block';
    this.canv.style.pointerEvents = 'none';

    parent.appendChild(this.canv);
  }

  public setLine(l: Line) {
    this.line = l;
    this.render();
  }

  render() {
    let ctx = this.canv.getContext('2d');

    ctx.clearRect(0, 0, this.canv.width, this.canv.height);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (this.line.points.length < 3) {
      ctx.fillStyle = this.line.color;
      ctx.beginPath();
      ctx.arc(
        this.line.points[0].x,
        this.line.points[0].y,
        this.line.width / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.closePath();

      return;
    }

    // quadratic curve to for each point, where the control point is the average of this points less the next

    ctx.strokeStyle = this.line.color;
    ctx.lineWidth = this.line.width;

    ctx.beginPath();

    ctx.moveTo(this.line.points[0].x, this.line.points[0].y);

    let i;

    for (i = 1; i < this.line.points.length - 2; i++) {
      let nextPoint = this.line.points[i + 1];
      let thisPoint = this.line.points[i];

      const c = (nextPoint.x + thisPoint.x) / 2;
      const d = (nextPoint.y + thisPoint.y) / 2;

      ctx.quadraticCurveTo(nextPoint.x, nextPoint.y, c, d);
    }

    ctx.quadraticCurveTo(
      this.line.points[i].x,
      this.line.points[i].y,
      this.line.points[i + 1].x,
      this.line.points[i + 1].y
    );

    ctx.stroke();
  }
}
