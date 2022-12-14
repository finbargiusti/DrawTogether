import type Lobby from './lobby';

let lobby: Lobby = null;

export function setLobby(l: Lobby) {
  lobby = l;
}

export function getLobby() {
  if (lobby == null) {
    throw new Error('Lobby not set.');
  }
  return lobby;
}
