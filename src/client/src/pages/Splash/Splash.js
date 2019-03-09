import React from "react";
import logo from "./logo.png";
import Button from "../../elems/Button";

import "./Splash.css";

let Splash = ({ setCurrPage }) => {
  return (
    <div className="splash">
      <img src={logo} className="splash__logo" alt="DrawTogether logo" />
      <div className="splash__button__wrapper">
        <Button
          onclick={() => {
            setCurrPage("Create");
          }}
        >
          Create Lobby
        </Button>
        <Button
          onclick={() => {
            setCurrPage("Join");
          }}
        >
          Join Lobby
        </Button>
      </div>
    </div>
  );
};

export default Splash;
