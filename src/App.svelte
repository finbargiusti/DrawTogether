<script lang="ts">
  import Game from './Game.svelte';
  import Lobby from './logic/lobby';

  export let lobby: Lobby | false = false;

  export let idInput: string = '';

  export let createLobby = () => {
    lobby = new Lobby();
  };

  export let joinLobby = () => {
    lobby = new Lobby(idInput);
  };
</script>

{#if !lobby}
  <div class="container">
    <div class="logo" />

    <p>Welcome to Drawtogether!</p>

    <button on:click={createLobby}>Create Lobby</button>

    <input type="text" bind:value={idInput} />

    <button on:click={joinLobby}>Join Lobby</button>
  </div>
{:else}
  <Game {lobby} />
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
