<script lang="ts">
  import {
    compressRecording,
    RECORDABLE_MESSAGE_TITLES,
    type RecordingData,
  } from '../logic/dtr';
  import { toMessageObject } from '../logic/message';
  import { getConnection } from '../logic/state';

  // Write recording data here

  const conn = getConnection();

  let recording: RecordingData = [];

  function downloadRecording(data: Uint8Array) {
    const b = new Blob([data]);
    const url = window.URL.createObjectURL(b);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'recording.dtr';
    downloadLink.click();
    downloadLink.remove();
  }

  $: {
    if (!recordingEnabled && recording.length > 0) {
      // ? Recording disabled with some length of recording saved.
      // REcording is disabled by default so we will assume that this was
      // intended to be saved.
      downloadRecording(compressRecording(recording));
    }
  }

  let recordingEnabled = false;

  RECORDABLE_MESSAGE_TITLES.forEach((t) =>
    conn.on(t, (d, from) => {
      if (recordingEnabled) {
        recording.push({
          time: Date.now(),
          title: t,
          data: d,
          from,
        });
      }
    })
  );
</script>

<div class="record-wrap">
  <label for="recording">
    {recordingEnabled ? 'Stop Recording' : 'Start Recording'}
  </label>
  <input type="checkbox" id="recording" bind:checked={recordingEnabled} />
</div>

<!-- TODO: make prettier colors -->
<style lang="sass">
  .record-wrap
    display: flex
    justify-content: space-between
    align-items: center

    input#recording
      position: relative
      width: 0px
      height:0px

      &:before
        content: ""
        position: absolute
        top: -5px
        left: -5px
        width: 10px
        height: 10px
        border-radius: 50%
        background-color: #cccccc
        box-shadow: 0px 0px 0px 2.5px #333333, 0px 0px 0px 5px #cccccc

      &:is(:checked)::before
        background-color: #ff0000
        box-shadow: 0px 0px 0px 2.5px #333333, 0px 0px 0px 5px #ff0000
</style>
