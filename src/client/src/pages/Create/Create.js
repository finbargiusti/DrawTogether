import React, { useState } from "react";
import Input from "../../elems/Input";
import Button from "../../elems/Button";
import createLobby from "./createLobby.js";

const Create = ({ setCurrPage }) => {
  const [canvasHeight, setCanvasHeight] = useState();
  const [canvasWidth, setCanvasWidth] = useState(500);
  const [maxPlayers, setMaxPlayers] = useState(1);
  const [allowSpectators, setAllowSpectators] = useState(false);

  let send = () => {
    createLobby({
      height: Math.max(100, Math.min(5000, canvasHeight)),
      width: Math.max(100, Math.min(5000, canvasWidth)),
      maxPlayers: Math.max(1, Math.min(20, maxPlayers)),
      allowSpectators
    }).then(response => {
      if (response.success) {
        console.log(response.id);
        setCurrPage("Splash");
      } else if (response === "Error") {
        console.log("Whoops");
      }
    });
  };

  return (
    <div className="center-wrapper">
      <div>
        <h3>Canvas:</h3>
        <Input
          changeValue={setCanvasHeight}
          propsObject={{
            placeholder: "Canvas Height",
            type: "number",
            min: 100,
            max: 5000
          }}
        />
        <Input
          changeValue={setCanvasWidth}
          propsObject={{
            placeholder: "Canvas Width",
            type: "number",
            min: 100,
            max: 5000
          }}
        />
      </div>
      <div>
        <h3>Players:</h3>
        <Input
          changeValue={setMaxPlayers}
          propsObject={{
            placeholder: "Max players",
            type: "number",
            min: 1,
            max: 20
          }}
        />
        <Input
          changeValue={setAllowSpectators}
          label="Allow Spectators"
          propsObject={{
            type: "checkbox",
            name: "spectators"
          }}
        >
          Allow Spectators
        </Input>
      </div>
      <div>
        <Button onclick={send}>Create Lobby</Button>
      </div>
    </div>
  );
};

export default Create;
