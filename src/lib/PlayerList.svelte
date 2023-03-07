<script lang="ts">
  import { onMount } from 'svelte';
  import { getConnection } from '../logic/state';

  const conn = getConnection();

  type playerState = 'open' | 'closed' | 'connecting';

  let playerList: { [id: string]: playerState } = {};

  let ourState: [string, playerState];

  const updateOurState = () => {
    ourState = [
      conn.peerConnection.id,
      conn.peerConnection.open ? 'open' : 'closed',
    ];
  };

  const updatePlayerList = () => {
    conn.nodes.forEach(dc => {
      playerList[dc.peer] = dc.open
        ? 'open'
        : dc.peerConnection.connectionState == 'connecting'
        ? 'connecting'
        : 'closed';
    });
  };

  onMount(updateOurState);

  conn.peerConnection.on('open', updateOurState); // update own state on open
  conn.peerConnection.on('close', updateOurState); // update own state on close

  conn.on('new-peer', dc => {
    updatePlayerList();

    (['open', 'close', 'iceStateChanged'] as const).forEach(ev =>
      dc.on(ev, updatePlayerList)
    );
  });
</script>

<ul class="player-list">
  {#if ourState}
    <li class={ourState[1]}>
      {ourState[0] ? ourState[0].substring(0, 5) : 'Loading...'}
    </li>
  {/if}
  {#if playerList}
    {#each Object.entries(playerList) as [id, state]}
      <li class={state}>
        {id ? id.substring(0, 5) : 'Loading...'}
      </li>
    {/each}
  {/if}
</ul>

<style lang="scss">
  .player-list {
    list-style-type: none;
    padding: 0;
    margin: 0;

    li {
      padding: 4px 8px 4px 8px;
      background-color: #434343;
      box-sizing: border-box;
      margin: 0;

      @media (prefers-color-scheme: light) {
        background-color: #ececec;
      }

      &:first-child {
        font-weight: bold;

        &::after {
          content: ' (you)';
        }
      }

      &:nth-child(odd) {
        background-color: #535353;
        @media (prefers-color-scheme: light) {
          background-color: #e3e3e3;
        }
      }

      &.open {
        color: lightgreen;
        @media (prefers-color-scheme: light) {
          color: darkgreen;
        }
      }

      &.connecting {
        color: orange;
      }
      &.closed {
        color: #ff4444;
      }
    }
  }
</style>
