<script lang="ts">
  import Draggable from './Draggable.svelte';

  export let sendChat: (message: string) => void;

  export let chats: string[];

  let chatInput = '';

  let handleKeypress = (e: KeyboardEvent) => {
    if (e.key == 'Enter') {
      sendChat(chatInput);
      chatInput = '';
    }
  };
</script>

<Draggable title="messages">
  <ul class="chats">
    {#each chats as chat}
      <li>{chat}</li>
    {/each}
  </ul>
  <input
    class="input"
    type="text"
    placeholder="enter message.."
    bind:value={chatInput}
    on:keypress={handleKeypress}
  />
</Draggable>

<style lang="sass">
.chats
  width: 100%
  list-style-type: none
  margin: 0
  padding: 0
  max-height: 100px
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
