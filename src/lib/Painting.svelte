<script lang="ts">
  import { onMount } from 'svelte';
  import type { CanvasOptions } from '../logic/canvas';
  import { drawLine, type Line } from '../logic/line';
  import { drawing, getConnection, lineOpts, setDrawing } from '../logic/state';
  import Frame from './Frame.svelte';
  import { v1 as genuuid } from 'uuid';
  import type { FrameData } from './Painting';

  let opts: CanvasOptions;

  const conn = getConnection();

  const MAX_FRAMES = 1;

  // Canvas sizes

  let innerWidth: number;
  let innerHeight: number;

  conn.on('canvas-definition', options => {
    opts = options;
  });

  if (conn.isHost) {
    onMount(() => {
      conn.emit('canvas-definition', {
        height: innerHeight,
        width: innerWidth,
        bgColor: '#ffffff',
      });
      conn.on('new-peer', n => {
        // n will be closed at first
        n.on('open', () => {
          conn.sendToPeer(n, 'canvas-definition', opts);
        });
      });
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
    return;
  }

  async function updateFrame(id: string, line: Line) {
    const f = frames.find(v => v.id == id);

    if (!f) {
      await addFrame({
        id,
        line,
      });
      return;
    }

    f.line = line;

    frames = frames;

    return;
  }

  conn.on('frame-update', fu => {
    updateFrame(fu.id, fu.line);
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

  // TODO: Implememnt equivalent touch events with some lib

  function mouseDown(ev: MouseEvent) {
    // TODO: Use a universal pipeline for updating frames

    setDrawing(true);

    const pos = getMousePosition(ev);

    thisFrame = {
      id: genuuid(),
      line: {
        points: [pos],
        opts: { ...$lineOpts },
      },
    };

    conn.sendToAll('frame-update', thisFrame, true);
    //                                         ^ means we will propogate
    //                                           to self as well
  }

  function updateCursor(pos: { x: number; y: number }, from: string) {
    cursors[from] = pos;
  }

  function mouseMove(ev: MouseEvent) {
    const pos = getMousePosition(ev);

    updateCursor(pos, 'you');

    // TODO: make this share the same self message propogation pattern as draws

    conn.sendToAll('cursor-move', pos);

    if (!$drawing) return;

    thisFrame.line.points = [...thisFrame.line.points, pos];

    thisFrame = thisFrame;

    conn.sendToAll('frame-update', thisFrame, true);
  }

  function mouseUp() {
    if (!$drawing) return;

    setDrawing(false);

    thisFrame = undefined;
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

<div class="background">
  {#if opts}
    <canvas
      class="frame main"
      height={opts.height}
      width={opts.width}
      style="background-color: {opts.bgColor}"
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

<style lang="scss">
  .background {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    transform: translateZ(0px);
    display: flex;
    justify-content: center;
    align-items: center;

    :global(.frame) {
      position: absolute;
      transform-origin: top left;
      background-color: transparent;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      cursor: none;
      pointer-events: none;

      &.main {
        pointer-events: all;
      }
    }
  }
</style>
