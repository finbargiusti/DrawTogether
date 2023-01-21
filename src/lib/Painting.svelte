<script lang="ts" context="module">
  export type FrameData = {
    id: string;
    line: Line;
  };
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import type { CanvasOptions } from '../logic/canvas';
  import { drawLine, type Line } from '../logic/line';
  import { drawing, getConnection, lineOpts, setDrawing } from '../logic/state';
  import Frame from './Frame.svelte';
  import { v1 as genuuid } from 'uuid';

  let opts: CanvasOptions;

  const conn = getConnection();

  const MAX_FRAMES = 10;

  // Canvas sizes

  let innerWidth: number;
  let innerHeight: number;

  if (conn.isHost) {
    onMount(() => {
      opts = {
        height: innerHeight,
        width: innerWidth,
        bgColor: '#ffffff',
      };
      conn.on('new-peer', (n) => {
        n.send('canvas-definition', opts);
      });
    });
  } else {
    conn.on('canvas-definition', (options) => {
      opts = options;
    });
  }
  // Frame definitions

  /*
   Frame philosophy:
   TODO: this should be changed!

   There can only be up to 10 frames (linestrokes) MAX.

   when the length of frames exceeds 10, the first frame added will be pushed
   out of the stack and merged into the main canvas.

   the host will provide a line-array so that new peers can catch-up.
  */

  let frames: FrameData[] = [];

  /* If we need component reference, this is how it's done */
  // let frameComponents: { [id: string]: Frame } = {};

  let thisFrame: FrameData;

  async function addFrame(f: FrameData) {
    frames.push(f);
    if (frames.length > MAX_FRAMES) {
      const old_frame = frames.shift();

      await drawLine(mainCanvas.getContext('2d'), old_frame.line);
    }
    frames = frames;
  }

  function updateFrame(id: string, line: Line) {
    const f = frames.find((v) => v.id == id);

    if (!f) {
      addFrame({
        id,
        line,
      });
      return;
    }

    f.line = line;

    frames = frames;
  }

  conn.on('frame-update', ({ id, line }) => {
    updateFrame(id, line);
  });

  let mainCanvas: HTMLCanvasElement;
  let mouseCanvas: HTMLCanvasElement;

  function getMousePosition(ev: MouseEvent) {
    const r = mainCanvas.getBoundingClientRect();
    // get relative position

    const scale = r.width / opts.width;

    const x = (ev.pageX - r.x) / scale;
    const y = (ev.pageY - r.y) / scale;

    return { x, y };
  }

  let cursors: { [id: string]: { x: number; y: number } } = {};

  function mouseDown(ev: MouseEvent) {
    setDrawing(true);

    const pos = getMousePosition(ev);

    //TODO: make these options a setting
    thisFrame = {
      id: genuuid(),
      line: {
        points: [pos],
        opts: { ...$lineOpts }, // hopefullly works
      },
    };

    addFrame(thisFrame);

    conn.sendToAll('frame-update', thisFrame);
  }

  function updateCursor(pos: { x: number; y: number }, from: string) {
    cursors[from] = pos;
  }

  function mouseMove(ev: MouseEvent) {
    const pos = getMousePosition(ev);

    updateCursor(pos, 'you');

    conn.sendToAll('cursor-move', pos);

    if (!$drawing) return;

    thisFrame.line.points = [...thisFrame.line.points, pos];

    thisFrame = thisFrame;

    frames = frames;

    conn.sendToAll('frame-update', thisFrame);
  }

  function mouseUp(ev: MouseEvent) {
    if (!$drawing) return;

    setDrawing(false);

    thisFrame = undefined;

    frames = frames;
  }

  conn.on('cursor-move', (pos, from) => {
    cursors[from] = pos;
    cursors = cursors;
  });

  // render cursor
  $: {
    if (mouseCanvas) {
      const ctx = mouseCanvas.getContext('2d');
      ctx.clearRect(0, 0, opts.width, opts.height);
      for (const name in cursors) {
        const c = cursors[name];

        console.log($lineOpts);

        const { width, color } =
          name == 'you'
            ? $lineOpts
            : {
                width: 5,
                color: '#000000',
              };

        ctx.save();
        ctx.beginPath();
        ctx.arc(c.x, c.y, width, 0, 2 * Math.PI);
        ctx.fillStyle = `${color}80`; // add transparency
        ctx.fill();
        ctx.font = '12px serif';
        ctx.textAlign = 'center';
        ctx.fillText(name.substring(0, 6), c.x, c.y - 20 - width);
        ctx.restore();
      }
    }
  }
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div
  class="background"
  style="--bg-color: {opts ? opts.bgColor : 'transparent'}"
>
  {#if opts}
    <canvas
      class="frame main"
      height={opts.height}
      width={opts.width}
      bind:this={mainCanvas}
      on:mousemove={mouseMove}
      on:mouseup={mouseUp}
      on:mousedown={mouseDown}
      on:mouseleave={mouseUp}
    />
    <canvas
      class="frame"
      height={opts.height}
      width={opts.width}
      bind:this={mouseCanvas}
    />
    {#each frames as frameData}
      <Frame {frameData} {opts} />
      <!-- Add this in need of reference to frame component: bind:this={frameComponents[frameData.id]}-->
    {/each}
  {/if}
</div>

<style lang="sass">
.background
  width: 100%
  height: 100%
  position: relative
  overflow: hidden
  transform: translateZ(0px)
  display: flex
  justify-content: center
  align-items: center

  :global(.frame)
    position: absolute
    left: var(--offset-left)
    top: var(--offset-top)
    transform-origin: top left
    transform: scale(var(--canv-scale))
    background-color: transparent
    max-width: 100%
    max-height: 100%
    object-fit: contain
    cursor: none
    pointer-events: none

    &.main
      pointer-events: all
      background-color: var(--bg-color)
</style>
