<script lang="ts">
  import { onMount } from 'svelte';
  import type { CanvasOptions } from '../logic/canvas';
  import { drawing, getConnection, lineOpts, setDrawing, canvas } from '../logic/state';
  import type { FrameData } from '../logic/message';
  import { v1 as genuuid } from 'uuid';
  import FrameView from './FrameView.svelte';
  import CursorView from './CursorView.svelte';

  const conn = getConnection();

  let opts: CanvasOptions;

  conn.on('canvas-definition', options => {
    opts = options;
  });

  // Canvas sizes

  let innerWidth: number;
  let innerHeight: number;

  if (conn.isHost) {
    onMount(() => {
      conn.sendToAll(
        'canvas-definition',
        {
          height: innerHeight,
          width: innerWidth,
          bgColor: '#ffffff',
        },
        true
      );
      conn.on('new-peer', n => {
        // n will be closed at first
        n.on('open', () => {
          conn.sendToPeer(n, 'canvas-definition', opts);
        });
      });
    });
  }

  let frame: FrameData;

  let inputCanvas: HTMLCanvasElement;

  function getMousePosition(ev: MouseEvent) {
    const r = inputCanvas.getBoundingClientRect();
    // get relative position

    const scale = r.width / opts.width;

    const x = (ev.pageX - r.x) / scale;
    const y = (ev.pageY - r.y) / scale;

    return { x, y };
  }

  function mouseDown(ev: MouseEvent) {
    setDrawing(true);

    const pos = getMousePosition(ev);

    frame = {
      id: genuuid(),
      line: {
        points: [pos],
        opts: { ...$lineOpts },
      },
    };

    conn.sendToAll('frame-update', frame, true);
  }

  function mouseMove(ev: MouseEvent) {
    const pos = getMousePosition(ev);

    // TODO: make this share the same self message propogation pattern as draws

    conn.sendToAll('cursor-move', { pos, opts: $lineOpts }, true);

    if (!$drawing) return;

    frame.line.points = [...frame.line.points, pos];

    frame = frame;

    conn.sendToAll('frame-update', frame, true);
  }

  function mouseUp() {
    if (!$drawing) return;

    setDrawing(false);

    frame = undefined;
  }

  let zooming = false;

  const SCROLL_FACTOR = 0.05;

  function scroll(ev: WheelEvent) {
    if (ev.altKey && !zooming) {
      requestAnimationFrame(() => {
        zooming = true;
        const scroll = ev.deltaY * SCROLL_FACTOR;

        scale = Math.max(0.01, scale + scroll);
        zooming = false;
      });
    } 
  }

  let scale = 0.9;
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<FrameView {opts} bind:canvas={$canvas} {scale}>
  <CursorView {opts} />
  {#if opts}
    <canvas
      class="frame allow-touch"
      height={opts.height}
      width={opts.width}
      bind:this={inputCanvas}
      on:mousedown={mouseDown}
      on:mousemove={mouseMove}
      on:mouseup={mouseUp}
      on:wheel={scroll}
    />
  {/if}
</FrameView>
