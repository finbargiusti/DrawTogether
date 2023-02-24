<script lang="ts">
  import { getConnection } from '../logic/state';

  const conn = getConnection();
</script>

<!-- Not reactive for now -->
<p class="id">{conn.lobbyID}</p>

