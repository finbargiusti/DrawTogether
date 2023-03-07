<script lang="ts">
  import { setLineOpts } from '../logic/state';

  let color: `#${string}` = '#000000';

  let width: number = 5;

  $: {
    setLineOpts(opts => {
      opts = { color, width };

      return opts;
    });
  }
</script>

<div class="brush-options">
  <div>
    <label for="color">Brush color</label>
    <input id="color" type="color" bind:value={color} />
  </div>
  <div>
    <label for="size">Brush size</label>
    <input id="size" type="range" bind:value={width} />
  </div>
</div>

<style lang="scss">
  .brush-options {
    div {
      display: flex;
      justify-content: space-between;

      label {
        font-weight: bold;
      }
    }
  }
</style>
