<script lang="ts">
  import { afterUpdate } from 'svelte';
  import type { MessageData } from '../logic/message';
  import { getConnection } from '../logic/state';

  const conn = getConnection();

  let messages: { text: string; from: string; time: number }[] = [];

  let chatBox: HTMLUListElement;

  afterUpdate(() => {
    // scroll box to bottom on update of messages
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: 'smooth',
    });
  });

  function addMessage(
    { text, time, from: fromOverride }: MessageData<'chat'>,
    from: string
  ) {
    messages = [...messages, { text, from: fromOverride ?? from, time }];
    if (messages.length > 0 && time < messages[messages.length - 1].time) {
      messages = messages.sort((a, b) => b.time - a.time);
    }
  }

  conn.on('chat', addMessage);

  let chatInput = '';

  let handleKeypress = (e: KeyboardEvent) => {
    if (e.key == 'Enter' && chatInput) {
      const message: MessageData<'chat'> = {
        text: chatInput,
        time: new Date().getTime(),
      };

      conn.sendToAll('chat', message, true);

      chatInput = '';
    }
  };
</script>

<ul class="chats" bind:this={chatBox}>
  {#each messages as chat}
    <li>from {chat.from.substring(0, 5)}: {chat.text}</li>
  {/each}
</ul>
<input
  class="input"
  type="text"
  placeholder="enter message.."
  bind:value={chatInput}
  on:keypress={handleKeypress}
/>

<style lang="scss">
.chats { 
  width: 100%;
  list-style-type: none;
  margin: 0;
  padding: 0;
  max-height: 100px;
  overflow-y: scroll;

  li {
    padding: 4px 8px 4px 8px;
    box-sizing: border-box;
    margin: 0;

    &:nth-child(odd) {
      background-color: #535353;
      @media (prefers-color-scheme: light) {
        background-color: #e3e3e3;
      }
    }
  }
}

.input {
  width: 100%;
  color: white;
  padding: 4px 8px 4px 8px;
  box-sizing: border-box;
  background-color: #3e3e3e;
  border: none;

  @media (prefers-color-scheme: light) {
    background-color: #d3d3d3;
    color: black;
  }

}
</style>
