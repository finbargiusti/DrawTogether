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

  let scaleFactor: number;

  console.log({
    wh: window.innerHeight,
    ww: window.innerWidth,
    ch: c.height,
    cw: c.width,
  });

  scaleFactor = Math.min(
    window.innerHeight / c.height,
    window.innerWidth / c.width
  );

  console.log(scaleFactor);

  c.style.left =
    Math.max(0, (window.innerWidth - c.width * scaleFactor) / 2) + 'px';
  c.style.top =
    Math.max(0, (window.innerHeight - c.height * scaleFactor) / 2) + 'px';
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
  c.style.transformOrigin = 'top left';

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
