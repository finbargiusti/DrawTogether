<script lang="ts">
  import Tools from './lib/Tools.svelte';
  import Painting from './lib/Painting.svelte';
</script>

<div class="game">
  <div class="painting">
    <Painting />
  </div>
  <div class="tools">
    <Tools />
  </div>
</div>

<style lang="scss">
.game {
  height: 100%;
  width: 100%;

  .painting {
    height: 100%;
    width: 100%;
    position: relative;
    margin-top: 0;
  }

  .tools {
    position: absolute;
    width: 500px;
    height: 100%;
    top: 0px;
    pointer-events: none;
  }
}
</style>
