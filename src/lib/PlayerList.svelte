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

    &:first-child
      font-weight: bold 

      &::after
        content: " (you)"

    &:nth-child(odd)
      background-color: #535353,

    &.active
      color: lightgreen

    &.inactive
      color: #ff4444


</style>
