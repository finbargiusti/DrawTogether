<script lang="ts">
  import { onMount } from 'svelte';
  import type { CanvasOptions } from '../logic/canvas';
  import type Lobby from '../logic/lobby';
  import type { CanvasDefinitionMessage, LobbyMessage } from '../logic/message';

  export let lobby: Lobby;

  let options: CanvasOptions;

  let canvasElement: HTMLCanvasElement;
  let cursorCanvasElement: HTMLCanvasElement;

  onMount(() => {
    // TODO: CHANGE THIS DUMB ASS WAY OF DOING IT
    lobby.canvas = canvasElement;
    lobby.mouseCanvas = cursorCanvasElement;

    if (lobby.conn.isHost) {
      options = { width: 500, height: 400, bgColor: '#ffffff' };
      lobby.createPainting(options); // default values
    } else {
      lobby.on('canvas-definition', (m: LobbyMessage) => {
        options = (m as CanvasDefinitionMessage).data;
      });
    }
  });
</script>

{#if !options}
  <p>Fetching canvas...</p>
{/if}
<div
  class="background"
  style={options
    ? `width: ${options.width}px; height: ${options.height}px; background-color: ${options.bgColor}`
    : ''}
/>
<canvas
  style={options
    ? `display: block;margin-top: -${options.height}px`
    : 'display: none;'}
  class="canvas"
  bind:this={canvasElement}
  width={options ? options.width : '0px'}
  height={options ? options.height : '0px'}
/>
<canvas
  style={options
    ? `display: block;margin-top: -${options.height}px;z-index: 1000;`
    : 'display: none;'}
  class="cursorcanvas"
  bind:this={cursorCanvasElement}
  width={options ? options.width : '0px'}
  height={options ? options.height : '0px'}
/>

<style lang="sass">
.canvas
  cursor: none

.cursorcanvas
  position: absolute
  pointer-events: none


</style>
