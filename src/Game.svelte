<script lang="ts">
  import type Lobby from './logic/lobby';
  import Tools from './lib/Tools.svelte';
  import Painting from './lib/Painting.svelte';

  export let lobby: Lobby;
</script>

<div class="game">
  <div class="canvas">
    <Painting {lobby} />
  </div>
  <div class="tools">
    <Tools {lobby} />
  </div>
</div>

<style lang="sass">
.game
  height: 100%
  width: 100%

  .canvas
    height: 100%
    width: 100%
    position: relative
    margin-top: 0

  .tools
    position: absolute
    width: 500px
    height: 100%
    top: 0px
    pointer-events: none


</style>
