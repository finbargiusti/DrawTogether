class Lobby {
  constructor(LobbyId, height, width, maxPlayers, spectators) {
    this.LobbyId = LobbyId;
    this.height = height;
    this.width = width;
    this.maxPlayers = maxPlayers;
    this.spectators = spectators;
  }

  get id() {
    return this.LobbyId;
  }
}

module.exports = Lobby;
