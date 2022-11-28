<script lang="ts">
  import type Lobby from '../logic/lobby';
  import Draggable from './Draggable.svelte';

  export let lobby: Lobby;

  let playerlist: {
    id: string;
    active: boolean;
    you: boolean;
    host: boolean;
  }[] = [];

  lobby.conn.onPlayerListUpdate = (l) => {
    playerlist = l;
  };
</script>

<Draggable title="Player List">
  <ul class="player-list">
    {#each playerlist as player}
      <li
        class={(player.active ? 'active' : 'inactive') +
          (player.you ? ' you' : '')}
      >
        {player.id.substring(0, 5)}
        {player.host ? '(host)' : ''}
        {player.you ? '(you)' : ''}
      </li>
    {/each}
  </ul>
</Draggable>

<style lang="sass">
.player-list
  list-style-type: none
  padding: 0
  margin: 0
  
  li
    padding: 4px 8px 4px 8px
    background-color: #434343
    box-sizing: border-box
    margin: 0

    &:nth-child(odd)
      background-color: #535353,

    &.active
      color: lightgreen

    &.inactive
      color: #ff4444

    &.you
      font-weight: bold

</style>
