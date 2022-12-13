<script lang="ts">
  import { onMount } from 'svelte';
  import { createCanvas, type CanvasOptions } from '../logic/canvas';
  import type Frame from '../logic/frame';
  import type Lobby from '../logic/lobby';
  import type {
    CanvasDefinitionMessage,
    CursorUpdateMessage,
    FrameUpdateMessage,
    LobbyMessage,
  } from '../logic/message';

  import Painting from '../logic/painting';

  export let lobby: Lobby;

  let loaded = false;

  let container: HTMLDivElement;

  let painting: Painting;

  // TODO: make all other classes use this hierarchy model.
  function addMessageListeners() {
    lobby.on('cursor-move', (m) => {
      const c = m as CursorUpdateMessage;
      painting.updateCursor(c.data);
    });

    lobby.on('frame-update', (m) => {
      const f = m as FrameUpdateMessage;
      if (painting) {
        painting.updateFrame(f.data.line, f.data.id, m.from);
      }
    });

    lobby.onNewPeer(() => {
      lobby.conn.sendToAllPeers({
        title: 'canvas-definition',
        data: painting.options,
      });
    });
  }

  onMount(() => {
    if (lobby.conn.isHost) {
      // by default equal to the hosts screen size
      // TODO: is this a good idea?

      const default_options = {
        height: window.innerHeight,
        width: window.innerWidth,
        bgColor: '#ffffff',
      };

      painting = new Painting(default_options, lobby, {
        main: createCanvas(container, default_options),
        mouse: createCanvas(container, default_options, true),
      });

      addMessageListeners();

      // container.style.backgroundColor = default_options.bgColor;
    } else {
      lobby.on('canvas-definition', (m: LobbyMessage) => {
        let options = (m as CanvasDefinitionMessage).data;

        // disallow canvas re-definition
        // TODO: is this a good idea?
        painting = new Painting(options, lobby, {
          main: createCanvas(container, options),
          mouse: createCanvas(container, options, true),
        });

        // container.style.backgroundColor = options.bgColor;
      });
    }
  });
</script>

<div class="background" bind:this={container}>
  {#if !loaded}
    <div class="loading">
      <p>Fetching canvas...</p>
    </div>
  {/if}
</div>

<style lang="sass">
.background
  width: 100%
  height: 100%


</style>
