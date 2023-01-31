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

    <div class="options">
      <div class="create">
        <button on:click={createLobby}>Create Lobby</button>
      </div>
      <div class="join">
        <input type="text" bind:value={idInput} placeholder="Lobby code" />

        <button on:click={joinLobby}>Join Lobby</button>
      </div>
    </div>
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

  .options
    margin-top: 20px
    display: grid
    grid-template-areas: "create . join"
    grid-template-rows: 1fr
    grid-template-columns: 1fr 50px 1fr

    .create, .join
      display: flex
      flex-direction: column
      align-items: stretch
      justify-content: flex-start

    .create
      grid-area: create

    .join
      grid-area: join

      input 
        box-sizing: border-box
        padding: 12px 24px 12px 24px

      button
        margin-top: 12px
</style>
