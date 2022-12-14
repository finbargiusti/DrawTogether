<script lang="ts">
  import { getLobby } from '../logic/state';

  let lobby = getLobby();
</script>

<p class="id">{lobby.hostId}</p>

<style lang="sass">
.id
  @media (prefers-color-scheme: dark) 
    background-color: #3d3d3d
  @media (prefers-color-scheme: light) 
    background-color: #e9e9e9

</style>
