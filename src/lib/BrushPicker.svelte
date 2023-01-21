<script lang="ts">
  import { setLineOpts } from '../logic/state';

  let color: `#${string}` = '#000000';

  $: {
    setLineOpts((opts) => {
      opts.color = color;

      return opts;
    });
  }
</script>

<div>
  <input type="color" bind:value={color} />
</div>
