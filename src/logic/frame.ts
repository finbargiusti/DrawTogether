import type { CanvasOptions } from './canvas';
import type { Line } from './line';

import smooth from 'chaikin-smooth';

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

    // use chaikin-smooth to smooth our points.
    // this is a HUGE bonus to networking speeds
    // since we can predictably generate smooth lines
    // from shorter arrrays
    const smoothed: [number, number][] = smooth(
      this.line.points.map((p) => [p.x, p.y])
    );

    if (smoothed.length < 3) {
      // Line is too short to properly render using quadraticCurveTo

      ctx.fillStyle = this.line.color;

      // Draw a point to represent the start of the line for visual feedback
      ctx.beginPath();
      ctx.arc(
        smoothed[0][0],
        smoothed[0][1],
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

    ctx.moveTo(smoothed[0][0], this.line.points[0][1]);

    let i;

    for (i = 1; i < smoothed.length - 2; i++) {
      let nextPoint = smoothed[i + 1];
      let thisPoint = smoothed[i];

      const c = (nextPoint[0] + thisPoint[0]) / 2;
      const d = (nextPoint[1] + thisPoint[1]) / 2;

      ctx.quadraticCurveTo(nextPoint[0], nextPoint[1], c, d);
    }

    ctx.quadraticCurveTo(
      smoothed[i][0],
      smoothed[i][1],
      smoothed[i + 1][0],
      smoothed[i + 1][1]
    );

    ctx.stroke();
  }

  // destroy this canvas.
  public destroy() {
    this.canv.parentElement.removeChild(this.canv);
  }
}
