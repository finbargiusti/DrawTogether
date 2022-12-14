<script lang="ts">
  import Game from './Game.svelte';
  import Lobby from './logic/lobby';
  import { setLobby } from './logic/state';

  let loaded = false;

  let idInput: string = '';

  let createLobby = () => {
    setLobby(new Lobby());
    loaded = true;
  };

  let joinLobby = () => {
    setLobby(new Lobby(idInput));
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
