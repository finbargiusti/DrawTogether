export type CanvasOptions = {
  height: number;
  width: number;
  bgColor: string;
};

export type Cursor = {
  x: number;
  y: number;
  username: string;
};

function fitCanvasToWindow(c: HTMLCanvasElement) {
  if (c.height == window.innerHeight && c.width == window.innerWidth) {
    return;
  }

  const scaleFactor = Math.min(
    c.height / window.innerHeight,
    c.width / window.innerWidth
  );

  c.style.transform = `scale(${scaleFactor})`;
}

export function createCanvas(
  parent: HTMLElement,
  options: CanvasOptions,
  utility: boolean = false
) {
  const c = document.createElement('canvas');
  c.height = options.height;
  c.width = options.width;
  c.style.cursor = 'none';

  c.style.top = '0';

  c.style.position = 'absolute';

  fitCanvasToWindow(c);

  window.addEventListener('resize', () => {
    fitCanvasToWindow(c);
  });

  parent.appendChild(c);

  if (utility) {
    c.style.pointerEvents = 'none';
  } else {
    c.style.backgroundColor = options.bgColor;
  }

  return c;
}
