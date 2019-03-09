import React from "react";
import "./Button.css";

const Button = ({ children, onclick }) => (
  <div className="button">
    <p onClick={onclick}>{children}</p>
  </div>
);

export default Button;
