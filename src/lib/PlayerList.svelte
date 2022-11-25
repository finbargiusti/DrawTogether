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
  <ul>
    {#each playerlist as player}
      <li>
        {player.id.substring(0, 5)}
        {player.host ? '(host)' : ''}
        {player.you ? '(you)' : ''}
      </li>
    {/each}
  </ul>
</Draggable>
