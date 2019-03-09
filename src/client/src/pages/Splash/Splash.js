import React from "react";
import logo from "./logo.png";
import Button from "./elems/Button";

import "./Splash.css";

let Splash = () => {
  return (
    <div className="splash">
      <img src={logo} className="splash__logo" />
      <div className="splash__button__wrapper">
        <Button href="#">Create Lobby</Button>
        <Button href="#">Join Lobby</Button>
      </div>
    </div>
  );
};

export default Splash;
