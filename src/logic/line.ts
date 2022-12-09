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
