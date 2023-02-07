<!--
  This is the file to be used for playing both recordings, and live streams.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { CanvasOptions } from '../logic/canvas';
  import type {
    RecordableMessageTitle,
    RecordingData,
    RecordingDataItem,
  } from '../logic/dtr';
  import { drawLine, type Line } from '../logic/line';
  import type { MessageData } from '../logic/message';
  import Frame from './Frame.svelte';
  import type { FrameData } from './Painting.svelte';

  export let data: RecordingData;

  export let opts: CanvasOptions;

  let mainCanvas: HTMLCanvasElement;

  let frames: FrameData[] = [];

  /* If we need component reference, this is how it's done */
  // let frameComponents: { [id: string]: Frame } = {};

  const MAX_FRAMES = 5;

  async function addFrame(f: FrameData) {
    await frames.push(f);
    if (frames.length > MAX_FRAMES) {
      const old_frame = frames.shift();

      await drawLine(mainCanvas.getContext('2d'), old_frame.line);
    }
    frames = frames;
    return;
  }

  async function updateFrame(id: string, line: Line) {
    const f = frames.find((v) => v.id == id);

    if (!f) {
      await addFrame({
        id,
        line,
      });
      return;
    }

    f.line = line;

    frames = frames;

    return;
  }

  async function handleFrame(d: RecordingDataItem<RecordableMessageTitle>) {
    switch (d.title) {
      case 'chat':
        break;
      case 'frame-update':
        const data = d.data as MessageData<'frame-update'>;
        updateFrame(data.id, data.line);
        break;
    }
  }

  let index = 0;

  function renderFrame() {
    const thisFrame = data[index];
    handleFrame(thisFrame);
    if (index + 1 < data.length) {
      index++;
      setTimeout(renderFrame, data[index].time - thisFrame.time);
    }
  }

  // TODO: fix this VERY naive approach
  onMount(renderFrame);
</script>

<div class="background">
  <canvas
    class="frame main"
    height={opts.height}
    width={opts.width}
    bind:this={mainCanvas}
    style="background-color: {opts.bgColor}"
  />
  {#each frames as frameData}
    <Frame {frameData} {opts} />
  {/each}
</div>

<style lang="sass">
.background
  width: 100%
  height: 100%
  position: relative
  overflow: hidden
  transform: translateZ(0px)
  display: flex
  justify-content: center
  align-items: center

  :global(.frame)
    position: absolute
    transform-origin: top left
    background-color: transparent
    max-width: 100%
    max-height: 100%
    object-fit: contain
    pointer-events: none

    &.main
      pointer-events: all
      background-color: var(--bg-color)
</style>
