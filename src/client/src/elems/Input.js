import React from "react";
import "./Input.css";

const Input = ({ changeValue, type, propsObject }) => {
  const props = {
    onChange: e => {
      changeValue(e.target.value);
    },
    className: "input"
  };

  return <input {...Object.assign(props, propsObject)} />;
};

export default Input;
