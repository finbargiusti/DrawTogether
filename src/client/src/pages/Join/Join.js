import React, { useState } from "react";
import Input from "../../elems/Input";
import Button from "../../elems/Button";

import "./Join.css";

const getLobbyInfo = lobbyId => {
  if (lobbyId > 10) return true;
  else return false;
};

const Join = ({ setCurrLobbyId, setCurrPage }) => {
  const [lobbyId, setLobbyId] = useState("");

  const propsObject = {
    type: "number",
    placeholder: "Enter Lobby ID..",
    min: 1,
    max: 99999
  };

  const submitLobby = () => {};

  return (
    <div className="join">
      <Input changeValue={setLobbyId} propsObject={propsObject} />
      <div>
        <Button onclick={submitLobby}>Join Lobby</Button>
      </div>
    </div>
  );
};

export default Join;
