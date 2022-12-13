<script lang="ts">
  import type Lobby from '../logic/lobby';
  import Draggable from './Draggable.svelte';

  export let lobby: Lobby;
</script>

<p class="id">{lobby.hostId}</p>

<style lang="sass">
.id
  @media (prefers-color-scheme: dark) 
    background-color: #3d3d3d
  @media (prefers-color-scheme: light) 
    background-color: #e9e9e9

</style>
