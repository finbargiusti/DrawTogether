import React from "react";

const Button = ({ children, href }) => (
  <div className="splash__button">
    <a href={href}>{children}</a>
  </div>
);

export default Button;
