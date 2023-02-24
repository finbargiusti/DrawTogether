<script lang="ts">
  import ChatBox from './ChatBox.svelte';
  import PlayerList from './PlayerList.svelte';
  import LobbyId from './LobbyId.svelte';

  import interact from 'interactjs';
  import type { Interactable, DropEvent } from '@interactjs/types/index';
  import { onMount } from 'svelte';
  import Draggable from './Draggable.svelte';
  import BrushPicker from './BrushPicker.svelte';
  import Recorder from './Recorder.svelte';

  import {drawing} from "../logic/state";

  let toolbox: HTMLDivElement;

  let active = false;

  let open = true;

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
</script>

<div class={'tools' + (active ? ' active' : '')} bind:this={toolbox}>
  <div class="tool-wrap {!open && 'inactive'}">
    <Draggable titleName="Lobby ID">
      <LobbyId />
    </Draggable>
    <Draggable titleName="Player List">
      <PlayerList />
    </Draggable>
    <Draggable titleName="Messages">
      <ChatBox />
    </Draggable>
    <Draggable titleName="Brush Picker">
      <BrushPicker />
    </Draggable>
    <Draggable titleName="Recorder">
      <Recorder />
    </Draggable>
  </div>
  <button id="toolbox-open" class="{$drawing && 'drawing'}" on:click={() => open = !open}>
    {!open ? "⬇" : "⬆"}
  </button>
</div>

<style lang="scss">
.tools {
  grid-area: tools;
  transition: background-color 0.4s;

  .tool-wrap {
    overflow: hidden;
    margin-top: 0px; 

    max-height: calc(100vh - 50px);

    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    transition: max-height 0.4s;
    gap: 8px;
    margin-bottom: 10px;

    &.inactive {
      max-height: 0px; 
      margin-bottom: 0px;
    }
  }

  #toolbox-open {

    background-color: #333;
    color: white;

    pointer-events: all;
    height: 40px;
    width: 100%;
    transition: opacity 0.4s;

    &:hover {
      background-color: #444;
    }

    &.drawing {
      pointer-events: none;
      opacity: 0;
    }
  }

  &.active {
    background-color: rgba(120, 120, 120, 0.3);
  }
}
</style>
