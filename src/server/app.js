const express = require("express");

const app = express();

app.use(express.json());

// Lobby

const Lobbies = [];

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

const assignLobby = (data, id) => {
  if (
    Lobbies.filter(lobby => {
      return (lobby.id = id);
    }) === 0
  ) {
    Lobbies.push(
      new Lobby(id, data.height, data.width, data.maxPlayers, data.spectators)
    );
    return true;
  }
  return false;
};

const generateId = () => {
  const min = 11111;
  const max = 99999;

  return Math.floor(Math.random() * (max - min)) + min;
};

app.post("/api/create-lobby", (req, res) => {
  const query = req.body;

  let trialId;

  if (query.height !== undefined) {
    do {
      trialId = generateId();
    } while (!trialId);
  } else {
    res.send("Error");
  }

  res.json({
    success: true,
    id: trialId
  });

  // if (app.get("env") === "development") console.log(err.stack);
});

app.listen(process.env.PORT || 3001);
