const express = require("express");

const Lobby = require("../classes/lobby");

module.exports = function(app) {
  const router = express.Router();
  router.post("/", (req, res) => {
    const query = req.body;

    let trialId;

    if (query.height !== undefined) {
      do {
        trialId = generateId();
      } while (!trialId);
    } else {
      res.send("Error");
    }

    assignLobby(query, trialId);

    res.json({
      success: true,
      id: trialId
    });
  });
  const assignLobby = (data, id) => {
    console.log(app.locals.lobbies);
    if (
      app.locals.lobbies.filter(lobby => {
        return (lobby.id = id);
      }).length === 0
    ) {
      app.locals.lobbies.push(
        new Lobby(
          id,
          data.height,
          data.width,
          data.maxPlayers,
          data.allowSpectators
        )
      );
      console.log(app.locals.lobbies);
      return true;
    }
    return false;
  };

  const generateId = () => {
    const min = 11111;
    const max = 99999;

    return Math.floor(Math.random() * (max - min)) + min;
  };

  return router;
};
