import React, { useState } from "react";
import "./Input.css";

const Input = ({ changeValue, propsObject, label }) => {
  const [checkboxState, setCheckboxState] = useState(false);

  const props = {
    onChange: e => {
      changeValue(e.target.value);
    },
    className: "input",
    id: { label }
  };

  return (
    <label
      className="inputWrapper"
      onMouseDown={() => {
        setCheckboxState(!checkboxState);
        console.log(checkboxState);
      }}
    >
      {propsObject.type === "checkbox" && (
        <span
          className={"inputWrapper__icon " + (checkboxState && "toggled")}
        />
      )}
      {label && <p className="inputWrapper__label">{label}</p>}
      <input {...Object.assign(props, propsObject)} />
    </label>
  );
};

export default Input;
