<!--
  Main entry point for DrawTogether
  Compared to other files, this shit is a mess.

  TODO: Clean this file up and improve routing.

-->
<script lang="ts">
  import Game from './Game.svelte';
  import Play from './Play.svelte';
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

  let tab_option = 0;

  const setTab = (to: number) => () => {
    tab_option = to;
  };
</script>

{#if !loaded && !recording}
  <div class="container">
    <div class="logo" />

    <div class="tabs">
      <div class="tabulator">
        <div class="options-wrap">
          <!-- CAN a11Y FUCK OFF-->
          <span class={tab_option == 0 && 'active'} on:click={setTab(0)}
            >Draw</span
          ><span class={tab_option == 1 && 'active'} on:click={setTab(1)}
            >Play</span
          >
        </div>
      </div>
      <div class="draw {tab_option == 0 && 'visible'}">
        <div class="itemwrap">
          <div class="create">
            <button on:click={createLobby} class="default">Create Lobby</button>
          </div>
          <div class="div" />
          <div class="join">
            <input type="text" bind:value={idInput} placeholder="Lobby code" />

            <button on:click={joinLobby} class="default">Join Lobby</button>
          </div>
        </div>
      </div>
      <div class="play {tab_option == 1 && 'visible'}">
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
        >
          <p class="instruction">Drag dtr file here</p>
        </div>
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
  </div>
{:else if loaded}
  <!-- Game has started -->
  <Game />
{:else}
  <!-- Recording must be true... -->
  <!-- Which means that we are trying to plyback a dtr recording-->
  <Play data={recording.data} opts={recording.opts} />
{/if}

<style lang="scss">
.container  {
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-areas: "logo" "tabs";
  grid-template-columns: 1fr;
  grid-template-rows: 3fr 9fr;

  .logo {
    grid-area: logo;
    margin: 36px 0px 36px 0px;
  }

  .tabs {

    grid-area: tabs;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas: "tabulator" "content";
    place-content: center;

    .tabulator {
      display: flex;
      justify-content: center;

      .options-wrap {
        border-radius: 5px;
        overflow: hidden;

        span {
          box-sizing: border-box;
          user-select: none;
          padding: 8px 24px 8px 24px;
          display: inline-block;
          font-size: 16px;
          background-color: #333;
          cursor: pointer;

          @media (prefers-color-scheme: light) {
            background-color: #ddd;
          }

          &.active {
            background-color: #444;

            @media (prefers-color-scheme: light) {
              background-color: #ccc;
            }
          }
        }
      }
    }

    .play {
      display: none;
      grid-area: content;
      flex-direction: column;
      align-items: center;
      justify-content: start;
      margin-top: 20px;

      &.visible {
        display: flex;
      }

      #file-fallback {
        display: none;
      }

      .drop-zone {
        aspect-ratio: 2;
        width: 95%;
        max-width: 600px;
        margin: 12px 24px 12px 24px;
        border: 3px #aaa dashed;
        border-radius: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
  
        .instruction {
          color: #888;
          font-size: 18px;

          @media (prefers-color-scheme: light) {
            color: #444 ;
          }
        }
      }
    }


    .draw{
      grid-area: content;
      margin-top: 20px;
      display: none;
      padding-top: 24px;
      justify-content: center;
      align-items: start;

      &.visible {
        display: grid;
      }

      .itemwrap {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: auto 16px 0px 16px auto;
        grid-template-areas: "create" "." "div" "." "join";

        .div {
          grid-area: div; // Divider
          box-sizing: border-box;
          border: 1px #ccc dotted;

          @media (prefers-color-scheme: light) {
            border-color: #333
          }
        }

        .create, .join {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .create {
          grid-area: create;
        }

        .join {
          grid-area: join;

          input {
            box-sizing: border-box;
            padding: 12px 24px 12px 24px;
          }
        }
      }
    }
  }
}
</style>
