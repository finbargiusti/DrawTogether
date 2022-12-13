import type Lobby from './lobby';

let lobby: Lobby;

export function setLobby(l: Lobby) {
  lobby = l;
}

export function getLobby() {
  return lobby;
}
