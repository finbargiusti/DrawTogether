import React from "react";
import logo from "./logo.png";

import "./Splash.css";

let Splash = () => {
  return (
    <div className="splash">
      <img src={logo} className="splash__logo" />
    </div>
  );
};

export default Splash;
