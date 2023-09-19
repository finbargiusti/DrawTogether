<!--
  This is the file to be used for playing both recordings, and live streams.
-->
<script lang="ts">
  
  import { onMount } from 'svelte';
  import type {
    RecordingData,
  } from './logic/dtr';
  import {getEmitter } from './logic/state';
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

  function renderFrame() {
    const thisFrame = data[index];
    msg.emit(thisFrame.title, thisFrame.data, thisFrame.from);
    if (index + 1 < data.length) {
      index++;
      setTimeout(renderFrame, data[index].time - thisFrame.time);
    }
  }

  // TODO: fix this VERY naive approach
  onMount(() => {

    const background = new Image();

    background.onload = () => {
      canvas.getContext('2d').drawImage(background, 0, 0);
    };

    background.src = bg;

    renderFrame()
  });
</script>


<FrameView {opts} bind:canvas>
  <CursorView {opts} />
  <div class="chatbox">
    {#each messages as m}
      <p>
        {m.from.slice(0, 5)}: {m.text}
      </p>
    {/each}
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
</style>
