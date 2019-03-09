import React, { useState } from "react";
import Splash from "./pages/Splash/";
import Create from "./pages/Create/";
import Join from "./pages/Join/";
import "./App.css";

const App = () => {
  let [currPage, setCurrPage] = useState("Splash");
  let [lobbyId, setLobbyId] = useState(0);

  return (
    <div className="App">
      <p className="notice">DrawTogether Peer2Peer Pre-Alpha</p>
      {currPage === "Splash" && <Splash setCurrPage={setCurrPage} />}
      {currPage === "Create" && (
        <Create setCurrPage={setCurrPage} setCurrLobbyId={setLobbyId} />
      )}
      {currPage === "Join" && <Join />}
    </div>
  );
};

export default App;
