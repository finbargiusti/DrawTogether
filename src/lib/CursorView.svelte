<script lang="ts">
  import type { CanvasOptions } from "../logic/canvas";
    import type { CursorMoveMessage } from "../logic/message";
  import {getEmitter} from "../logic/state";

  let mouseCanvas: HTMLCanvasElement;
  export let opts: CanvasOptions;

  let cursors: { [id: string]: CursorMoveMessage } = {};

  function updateCursor(pos: CursorMoveMessage, from: string) {
    cursors[from] = pos;
    cursors = cursors;
  }

  const msg = getEmitter();
  msg.on('cursor-move', updateCursor);

  $: {
    if (opts && mouseCanvas && cursors) {
      const ctx = mouseCanvas.getContext('2d');
      ctx.clearRect(0, 0, opts.width, opts.height);
      for (const name in cursors) {
        const c = cursors[name];
        const {x, y} = c.pos;
        const {width, color} = c.opts;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, width/2, 0, 2 * Math.PI);
        ctx.fillStyle = `${color}80`; // add transparency
        ctx.fill();
        ctx.font = '12px serif';
        ctx.textAlign = 'center';
        ctx.fillText(name.substring(0, 6), x, y - 20 - width);
        ctx.restore();
      }
    }
  }

</script>


{#if opts}
  <canvas
    class="frame"
    height={opts.height}
    width={opts.width}
    bind:this={mouseCanvas}
  />
{/if}
