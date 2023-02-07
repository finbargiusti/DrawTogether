<script lang="ts">
  import Game from './Game.svelte';
  import Play from './lib/Play.svelte';
  import type { CanvasOptions } from './logic/canvas';
  import { Connection } from './logic/connection';
  import { deCompressRecording, type RecordingData } from './logic/dtr';
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

  let recording: {
    opts: CanvasOptions;
    data: RecordingData;
  } = undefined;

  function playRecording(d: ArrayBuffer) {
    try {
      recording = deCompressRecording(d);
    } catch (e) {
      console.error(e);
    }
  }

  let fileFallback: HTMLInputElement;
</script>

{#if !loaded && !recording}
  <div class="container">
    <div class="logo" />

    <div class="draw">
      <div class="title">
        <h2>Draw</h2>
      </div>
      <div class="create">
        <button on:click={createLobby} class="default">Create Lobby</button>
      </div>
      <div class="div">
        <p>— or —</p>
      </div>
      <div class="join">
        <input type="text" bind:value={idInput} placeholder="Lobby code" />

        <button on:click={joinLobby} class="default">Join Lobby</button>
      </div>
    </div>
    <div class="play">
      <div class="title">Play</div>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="drop-zone"
        on:click={() => fileFallback.click()}
        on:dragover={(e) => {
          e.stopPropagation();
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        on:drop={(e) => {
          e.stopPropagation();
          e.preventDefault();
          const file = e.dataTransfer.files[0];

          file.arrayBuffer().then(playRecording);
        }}
      />
      <input
        type="file"
        id="file-fallback"
        bind:this={fileFallback}
        on:change={(e) => {
          const target = e.target;

          // @ts-ignore // this sucks
          const f = target.files[0]; // assume just one file

          f.arrayBuffer().then(playRecording);
        }}
        accept=".dtr"
      />
    </div>
  </div>
{:else if loaded}
  <Game />
{:else}
  <!--  Recording must be true... -->
  <Play data={recording.data} opts={recording.opts} />
{/if}

<style lang="sass">
.container 
  height: 100vh
  width: 100vw
  display: grid
  grid-template-areas: "logo logo" "draw play"
  grid-template-columns: 1fr 1fr
  grid-template-rows: 1fr 9fr

  .logo
    grid-area: logo
    margin: 12px 0px 12px 0px

  .play
    grid-area: play
    display: flex
    flex-direction: column
    align-items: stretch
    justify-content: center

    #file-fallback
      display: none

    .drop-zone
      height: 300px
      margin: 12px 24px 12px 24px
      border: 5px white dashed


  .draw
    margin-top: 20px
    grid-area: draw
    display: grid
    grid-template-areas: "title" "create" "div" "join"
    grid-template-columns: 1fr
    grid-template-rows: auto 1fr 50px 1fr

    .title
      grid-area: title
      text-align: center
      font-size: 24px

    .div
      grid-area: div
      p
        text-align: center

    .create, .join
      display: flex
      flex-direction: column
      align-items: center
      gap: 8px

    .create
      grid-area: create
      justify-content: flex-end

    .join
      grid-area: join
      justify-content: flex-start

      input 
        box-sizing: border-box
        padding: 12px 24px 12px 24px
</style>
