<script lang="ts">
  import { getConnection } from '../logic/state';

  const conn = getConnection();
</script>

<!-- Not reactive for now -->
<p class="id">{conn.lobbyID}</p>

<style lang="sass">
.id
  @media (prefers-color-scheme: dark) 
    background-color: #3d3d3d
  @media (prefers-color-scheme: light) 
    background-color: #e9e9e9

</style>
