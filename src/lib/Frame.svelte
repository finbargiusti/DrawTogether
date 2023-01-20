<script lang="ts">
  import type { CanvasOptions } from '../logic/canvas';
  import { drawLine, type Line } from '../logic/line';

  import type { FrameData } from './Painting.svelte';

  export let frameData: FrameData;

  let line;

  $: line = frameData.line;

  export let opts: CanvasOptions;

  let canvas: HTMLCanvasElement;

  export const getBitMap = () => {
    return new Promise<ImageBitmap>((resolve, reject) => {
      canvas.toBlob((blob) => {
        createImageBitmap(blob).then(resolve).catch(reject);
      });
    });
  };

  // render the canvas
  function render(l: Line) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear whole canvas
    ctx.clearRect(0, 0, opts.width, opts.height);

    drawLine(ctx, l);
  }

  $: {
    if (canvas != null) {
      render(line);
    }
  }
</script>

<canvas
  bind:this={canvas}
  height={opts.height}
  width={opts.width}
  class="frame"
/>
