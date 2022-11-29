<script lang="ts">
  import type Lobby from '../logic/lobby';
  import ChatBox from './ChatBox.svelte';
  import PlayerList from './PlayerList.svelte';

  import interact from 'interactjs';
  import type { Interactable, DropEvent } from '@interactjs/types/index';
  import { onMount } from 'svelte';
  import Draggable from './Draggable.svelte';

  let toolbox: HTMLDivElement;

  let active = false;

  onMount(() => {
    interact(toolbox).dropzone({
      accept: '.draggable *',
      ondrop: (event: DropEvent) => {
        event.relatedTarget.dispatchEvent(new CustomEvent('reset'));
      },
      listeners: {
        dropactivate() {
          active = true;
        },
        dropdeactivate() {
          active = false;
        },
      },
    });
  });

  export let lobby: Lobby;
</script>

<div class={'tools' + (active ? ' active' : '')} bind:this={toolbox}>
  <Draggable titleName="Player List">
    <PlayerList {lobby} />
  </Draggable>
  <Draggable titleName="Messages">
    <ChatBox {lobby} />
  </Draggable>
</div>

<style lang="sass">
.tools
  grid-area: tools
  display: flex
  flex-direction: column
  align-items: stretch
  justify-content: stretch
  transition: background-color 0.3s
  gap: 8px

  &.active
    background-color: rgba(255, 255, 255, 0.1)
</style>
