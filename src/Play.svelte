<script lang="ts">
  
  import { onMount } from 'svelte';
  import type {
    RecordingData,
  } from './logic/dtr';
  import { getEmitter } from './logic/state';
  import type { MessageData } from './logic/message';
  import FrameView from './lib/FrameView.svelte';
  import CursorView from './lib/CursorView.svelte';

  export let recording: RecordingData;

  let [bg, opts, ...data] = recording;

  const msg = getEmitter();

  let messages: MessageData<'chat'>[] = [];

  let canvas: HTMLCanvasElement;

  msg.on('chat', (data, from) => {
    data.from = data.from ?? from;

    messages = [...messages, data];

    const comp = JSON.stringify(data); // for comparison

    setTimeout(() => {
      // This is inefficient, but it shouldn't matter
      messages = messages.filter(d => JSON.stringify(d) !== comp);
    }, 20000);
  })

  let index = 0;

  let playing = true;

  function continuePlayback() {
    if (!playing || index > data.length) return;
    msg.emit(data[index].title, data[index].data, data[index].from);
    index++;
    setTimeout(
      () => {
        requestAnimationFrame(continuePlayback);
      }, data[index].time - data[index - 1].time
    )
  }

  function togglePlaying() {
    playing = !playing;
    if (playing) {
      requestAnimationFrame(continuePlayback);
    }
  }

  function reset() {
    index = 0;
    playing = false;

    clear();

    const background = new Image();

    background.onload = () => {
      canvas.getContext('2d').drawImage(background, 0, 0);
    };

    background.src = bg;

    requestAnimationFrame(continuePlayback);
  }

  // TODO: fix this VERY naive approach
  onMount(() => {
    reset();
  });

  let clear: () => void;
</script>


<FrameView {opts} bind:canvas bind:clear>
  <CursorView {opts} />
  <div class="chatbox">
    {#each messages as m}
      <p>
        {m.from.slice(0, 5)}: {m.text}
      </p>
    {/each}
  </div>
  <div class="controls">
    <button on:click={togglePlaying}>
      {#if playing}
        Pause
      {:else}
        Play
      {/if}
    </button>
    {#if index != 0}
      <button on:click={reset}>
          Restart
      </button>
    {/if}
  </div>
</FrameView>

<style lang="scss">
  @keyframes message {
    0% {
      opacity: 0;
      max-height: 0px;
    }

    2% {
      opacity: 1;
      max-height: 200px;
    }

    96% {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }

  .chatbox {
    overflow: hidden;
    position: absolute;
    bottom: 0px;
    left: 0px;
    width: 400px;

    p {
      box-sizing: border-box;
      padding: 6px 12px 6px 12px;
      font-size: 16px;
      background-color: #222222;
      animation: message 20s;

      &:nth-child(even) {
        background-color: #333333;
      }
    }
  }

  .controls {
    overflow: hidden;
    position: absolute;
    bottom: 0px;
    left: 0px;
    right: 0px;
    height: 200px;
    display: flex;
    align-items: center;
    gap: 16px;
    justify-content: center;

    button {
      background-color: #222;
      color: #eee;
      font-size: px;
      padding: 0px 48px 0px 48px;
    }
  }
</style>
