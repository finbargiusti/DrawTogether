<script lang="ts">
  import type { ChatMessage } from '../logic/message';
  import { afterUpdate } from 'svelte';
  import { getLobby } from '../logic/state';

  let lobby = getLobby();

  let messages: (ChatMessage & { from: string })[] = [];

  let chatBox: HTMLUListElement;

  afterUpdate(() => {
    // scroll box to bottom on update of messages
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: 'smooth',
    });
  });

  lobby.on('chat', (m) => {
    let c = m as ChatMessage & { from: string };
    messages = [...messages, c];
  });

  let chatInput = '';

  let handleKeypress = (e: KeyboardEvent) => {
    if (e.key == 'Enter' && chatInput) {
      messages = [
        ...messages,
        { title: 'chat', data: chatInput, from: lobby.conn.p.id },
      ];
      lobby.sendChat(chatInput);
      chatInput = '';
    }
  };
</script>

<ul class="chats" bind:this={chatBox}>
  {#each messages as chat}
    <li>from {chat.from.substring(0, 5)}: {chat.data}</li>
  {/each}
</ul>
<input
  class="input"
  type="text"
  placeholder="enter message.."
  bind:value={chatInput}
  on:keypress={handleKeypress}
/>

<style lang="sass">
.chats
  width: 100%
  list-style-type: none
  margin: 0
  padding: 0
  max-height: 100px
  overflow-y: scroll
  li
    padding: 4px 8px 4px 8px
    background-color: #434343
    box-sizing: border-box
    margin: 0

    &:nth-child(odd)
      background-color: #535353

.input
  width: 100%
  color: white
  padding: 4px 8px 4px 8px
  box-sizing: border-box
  background-color: #3e3e3e
  border: none
</style>
