import React from "react";

const Button = ({ children, onclick }) => (
  <div className="splash__button">
    <p onClick={onclick}>{children}</p>
  </div>
);

export default Button;
