import type { CanvasOptions } from './canvas';
import type { Line } from './line';

// to generate unique ids
import { v1 as genuuid } from 'uuid';

/**
 * A frame represents one continuous line drawn by any user
 *
 * @class
 */
export default class Frame {
  // uuid string
  id: string;

  // owner peer id string
  owner: string;

  // canvas belonging to this frame
  canv: HTMLCanvasElement;

  // line this frame is drawing
  line: Line;

  /**
   * @param {HTMLElement} parent Container of the canvasses in the app
   * @param {CanvasOptions} options Options Object
   */
  constructor(
    parent: HTMLElement,
    options: CanvasOptions,
    owner?: string,
    id?: string
  ) {
    this.canv = document.createElement('canvas');

    this.id = id ?? genuuid();

    this.canv.height = options.height;
    this.canv.width = options.width;

    this.canv.style.marginTop = `-${options.height}px`;
    this.canv.style.display = 'block';
    this.canv.style.pointerEvents = 'none';

    parent.appendChild(this.canv);

    if (owner) this.owner = owner;
  }

  /**
   * Sets the current line, and updates the canvas
   * @param {Line} l
   */
  public setLine(l: Line) {
    this.line = l;
    this.render();
  }

  /**
   * Renders this frame
   * @returns void
   */
  render() {
    const ctx = this.canv.getContext('2d');

    // Clear whole canvas
    ctx.clearRect(0, 0, this.canv.width, this.canv.height);

    // Makes ilnes appear more smooth
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (this.line.points.length < 3) {
      // Line is too short to properly render using quadraticCurveTo

      ctx.fillStyle = this.line.color;

      // Draw a point to represent the start of the line for visual feedback
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

  // destroy this canvas.
  public destroy() {
    this.canv.parentElement.removeChild(this.canv);
  }
}
