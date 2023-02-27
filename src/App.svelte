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
  import { getConnection, setConnection } from './logic/state';


  let idInput: string = '';

  type pageState = 'home' | 'drawing' | 'playback';

  let state: pageState = 'home';

  const setPageTitle = (st: pageState) => {
    switch(st) {
      case 'home':
        document.title = "DrawTogether v0.0.5"
        break;
      case 'drawing':
        document.title = "Lobby "  + getConnection().lobbyID;
        break;
      case 'playback':
        document.title = "Playback"
        break;
    }
  }

  let pushPageState = (st: pageState) => {
    history.pushState({st}, ""); 
    state = st;
    setPageTitle(state);
  }

  window.onpopstate = (e: PopStateEvent) => {

    if (!e.state || !('state' in e.state)) {
      // if equal to first state
      state = 'home';
      history.replaceState({state}, "")
      return;
    }

    let stateObj = e.state as {state: pageState};


    if (stateObj.state == "drawing" || (stateObj.state == "playback" && !recording)) {
      // forced into illegal state
      // we will disallow going back forward into a lobby or recording when none is there.

      state = 'home';

      history.replaceState({state}, "");
      return;
    }


    state = stateObj.state;
    setPageTitle(state);
  }

  let createLobby = () => {
    const id = Math.random().toString(36).substring(2, 8);

    const c = new Connection(id, true); // we are host

    setConnection(c);

    pushPageState('drawing');
  };

  let joinLobby = () => {
    const c = new Connection(idInput, false);

    setConnection(c);

    pushPageState('drawing');
  };

  let recording: {
    opts: CanvasOptions;
    data: RecordingData;
  } = undefined;

  function playRecording(d: ArrayBuffer) {
    try {
      recording = deCompressRecording(d);
      pushPageState('playback');
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

{#if state == "home"}
  <div class="blobs">
    <div class="blob one" />
    <div class="blob two" />
    <div class="blur-screen" />
  </div>
  <div class="container">
    <div class="logo-wrap" >
      <div class="logo" />
    </div>

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
{:else if state == "drawing"}
  <!-- Game has started -->
  <Game />
{:else}
  <!-- Recording must be true... -->
  <!-- Which means that we are trying to plyback a dtr recording-->
  <Play data={recording.data} opts={recording.opts} />
{/if}

<style lang="scss">
.container  {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-areas: "logo" "tabs";
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr;
  position: relative;
  z-index: 5;

  .logo-wrap {
    width: 100%;
    grid-area: logo;
    display: flex;
    place-content: center;
    position: relative;
    align-items: stretch;


    .logo {
      width: 95%;
      max-width: 600px;
    }
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
.blobs {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 1;

  .blob {
    border-radius: 50%;
    aspect-ratio: 1;
    position: absolute;

    &.one {
    padding: 150px;
    left: max(25px, calc(50% - 350px));
    top: calc(40% - 100px);
    background-color: #2ECC40;
    }

    &.two{
    padding: 150px;
    right: max(25px, calc(50% - 350px));
    bottom: calc(30% - 100px);
      background-color: rgb(83,15,97);
    }
  }

  .blur-screen {
    width: 100%;
    height: 100%;
    backdrop-filter: blur(100px);
  }
}
</style>
