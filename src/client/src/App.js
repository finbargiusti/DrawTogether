import React, { useState } from "react";
import Splash from "./pages/Splash/";
import Create from "./pages/Create/";
import Join from "./pages/Join/";
import "./App.css";

const App = () => {
  let [currPage, setCurrPage] = useState("Splash");

  return (
    <div className="App">
      {currPage === "Splash" && <Splash setCurrPage={setCurrPage} />}
      {currPage === "Create" && <Create />}
      {currPage === "Join" && <Join />}
    </div>
  );
};

export default App;
