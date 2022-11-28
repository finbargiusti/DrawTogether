<script lang="ts">
  export let title: string;

  let pos: { x: number; y: number } | undefined = undefined;
</script>

<div class="draggable">
  <div class="title">{title}</div>
  <div
    class="content"
    style={pos
      ? `position: absolute; left: ${pos.x}px; right: ${pos.y}px;`
      : ''}
  >
    <slot />
  </div>
</div>

<style lang="sass">
.draggable

  .title
    background-color: #33ee33
</style>
