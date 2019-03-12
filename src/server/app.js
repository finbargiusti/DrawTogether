const express = require("express");

const app = express();

const createLobby = require("./routes/create-lobby")(app);

app.use(express.json());

app.locals.lobbies = [];

app.use("/api/create-lobby", createLobby);

app.get("/ping", (req, res) => {
  res.send("pong");
});

// app.post("/api/join-lobby", (req, res) => {
//   const
// })

app.listen(process.env.PORT || 3001);
