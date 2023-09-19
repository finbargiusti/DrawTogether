<script lang="ts">
  import type { CanvasOptions } from '../logic/canvas';
  import { drawLine, type Line } from '../logic/line';
  import type { FrameData } from '../logic/message';
  import { getEmitter } from '../logic/state';
  import Frame from './Frame.svelte';

  const MAX_FRAMES = 5;

  export let canvas: HTMLCanvasElement = undefined;
  export let opts: CanvasOptions;

  export const clear = () => {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    frames = [];
  }

  let msg = getEmitter();

  let frames = [];

  async function addFrame(f: FrameData) {
    frames.push(f);
    if (frames.length > MAX_FRAMES) {
      const old_frame = frames.shift();

      await drawLine(canvas.getContext('2d'), old_frame.line);
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

  msg.on('frame-update', fu => {
    updateFrame(fu.id, fu.line);
  });

</script>

<div class="background">
  {#if opts}
    <canvas
      bind:this={canvas}
      style="background-color: {opts.bgColor};"
      class="frame main"
      width={opts.width}
      height={opts.height}
    />
    {#each frames as frameData}
      <Frame {frameData} {opts} />
    {/each}
    <slot />
    <!-- allow for overlays -->
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
      pointer-events: none;
      cursor: none;

    }
    :global(.frame.allow-touch) {
      pointer-events: all;
    }
  }
</style>
