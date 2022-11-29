<script lang="ts">
  import type Lobby from './logic/lobby';
  import Tools from './lib/Tools.svelte';
  import Painting from './lib/Painting.svelte';

  export let lobby: Lobby;
</script>

<div class="game">
  <Tools {lobby} />
  <div class="canvas">
    <p>{lobby.hostId}</p>
    <Painting {lobby} />
  </div>
</div>

<style lang="sass">
.game
  display: grid
  height: 100%
  width: 100%
  grid-template-columns: 400px 1fr
  grid-template-rows: 1fr
  grid-template-areas: "tools canvas"

  .canvas
    grid-area: "canvas"

</style>
