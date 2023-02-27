<script lang="ts">
  import { getConnection } from '../logic/state';

  const playerList = getConnection().playerlist;
</script>

<ul class="player-list">
  {#each $playerList as player}
    <li class={player.active ? 'active' : 'inactive'}>
      {player.id ? player.id.substring(0, 5) : 'Loading...'}
    </li>
  {/each}
</ul>

<style lang="scss">
.player-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  
  li {
    padding: 4px 8px 4px 8px;
    background-color: #434343;
    box-sizing: border-box;
    margin: 0;

    @media (prefers-color-scheme: light) {
      background-color: #ececec;
    }

    &:first-child {
      font-weight: bold ;

      &::after {
        content: " (you)";
      }
    }

    &:nth-child(odd) {
      background-color: #535353;
      @media (prefers-color-scheme: light) {
        background-color: #e3e3e3;
      }
    }

    &.active {
      color: lightgreen;
      @media (prefers-color-scheme: light) {
        color: darkgreen;
      }
    }

    &.inactive {
      color: #ff4444;
    }
  }
}


</style>
