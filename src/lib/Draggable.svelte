<script lang="ts">
  import interact from 'interactjs';
  import { onMount } from 'svelte';

  export let titleName: string;

  let container: HTMLDivElement;
  let title: HTMLParagraphElement;

  let tools: HTMLDivElement;

  onMount(() => {
    tools = container.parentElement as HTMLDivElement;

    title.addEventListener('reset', () => {
      tools.appendChild(container);
      pos = size = undefined;
    });

    interact(title)
      .draggable({
        listeners: {
          start() {
            if (size == undefined) {
              // on first drag
              let draggableRect = interact.getElementClientRect(container);
              let containerRect = interact.getElementClientRect(
                container.parentElement
              );
              size = {
                x: containerRect.width,
                y: draggableRect.height,
              };
              pos = {
                x: draggableRect.left,
                y: draggableRect.top,
              };
              container.parentElement.appendChild(container);
            }
          },
          move(event) {
            pos.x += event.dx;
            pos.y += event.dy;
            pos = pos;
          },
        },
      })
      .on('test', () => {
        alert('test');
      });
  });

  let size: { x: number; y: number } | undefined = undefined;

  let pos: { x: number; y: number } | undefined = undefined;
</script>

<div
  class="draggable"
  bind:this={container}
  style={pos && size
    ? `position: absolute; left: ${pos.x}px; top: ${pos.y}px; height: ${size.y}px; width: ${size.x}px;`
    : ''}
>
  <p class="title" bind:this={title}>{titleName}</p>
  <div class="content">
    <slot />
  </div>
</div>

<style lang="sass">
.draggable

  .title
    background-color: #33ee33
    margin: 0
    padding: 8px 12px 8px 12px
    text-align: center
    font-size: 14px

</style>
