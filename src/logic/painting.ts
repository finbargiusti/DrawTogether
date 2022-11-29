import type { CanvasOptions } from './canvas';

export default class Painting {
  canv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  options: CanvasOptions;

  constructor(canv: HTMLCanvasElement, options: CanvasOptions) {
    this.canv = canv;
    this.ctx = canv.getContext('2d');

    this.options = options;
  }
}
