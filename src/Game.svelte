<script lang="ts">
  import type Lobby from './logic/lobby';
  import ChatBox from './lib/ChatBox.svelte';
  // import type { ChatMessage } from './logic/message';
  import PlayerList from './lib/PlayerList.svelte';

  export let lobby: Lobby;
</script>

<div class="game">
  <div class="tools">
    <PlayerList {lobby} />
    <ChatBox {lobby} />
  </div>
  <p>{lobby.hostId}</p>
</div>

<style lang="sass">
.game
  display: grid
  height: 100%
  width: 100%
  grid-template-columns: 400px 1fr
  grid-template-rows: 1fr
  grid-template-areas: "tools canvas"

  .tools
    grid-area: tools
    display: flex
    flex-direction: column
    align-items: stretch
    justify-content: stretch
</style>
