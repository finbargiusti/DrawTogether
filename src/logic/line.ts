import smooth from 'chaikin-smooth';
/**
 * Represents a Line drawn on a Frame
 */
export type Line = {
  // list of points in the line
  points: { x: number; y: number }[];
  // width of the line
  width: number;
  color: `#${string}`;
};

export async function drawLine(ctx: CanvasRenderingContext2D, l: Line) {
  // Makes ilnes appear more smooth
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // use chaikin-smooth to smooth our points.
  // this is a HUGE bonus to networking speeds
  // since we can predictably generate smooth lines
  // from shorter arrrays
  const smoothed: [number, number][] = smooth(l.points.map((p) => [p.x, p.y]));

  if (smoothed.length < 3) {
    // Line is too short to properly render using quadraticCurveTo

    ctx.fillStyle = l.color;

    // Draw a point to represent the start of the line for visual feedback
    ctx.beginPath();
    ctx.arc(smoothed[0][0], smoothed[0][1], l.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    return;
  }

  // quadratic curve to for each point, where the control point is the average of this points less the next

  ctx.strokeStyle = l.color;
  ctx.lineWidth = l.width;

  ctx.beginPath();

  ctx.moveTo(smoothed[0][0], l.points[0][1]);

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

  return;
}
