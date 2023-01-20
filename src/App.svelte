<script lang="ts">
  import Game from './Game.svelte';
  import { Connection } from './logic/connection';
  import { setConnection } from './logic/state';

  let loaded = false;

  let idInput: string = '';

  let createLobby = () => {
    const id = Math.random().toString(36).substring(2, 8);

    const c = new Connection(id, true); // we are host

    setConnection(c);

    loaded = true;
  };

  let joinLobby = () => {
    const c = new Connection(idInput, false);

    setConnection(c);

    loaded = true;
  };
</script>

{#if !loaded}
  <div class="container">
    <div class="logo" />

    <p>Welcome to Drawtogether!</p>

    <button on:click={createLobby}>Create Lobby</button>

    <input type="text" bind:value={idInput} />

    <button on:click={joinLobby}>Join Lobby</button>
  </div>
{:else}
  <Game />
{/if}

<style lang="sass">
.container 
  height: 100vh
  width: 100vw
  display: flex
  align-items: center
  justify-content: center
  flex-direction: column

</style>
