import { useState } from "react";
import "./App.css";
import MineGrid from "./components/MineGrid/MineGrid";

function App() {

  return (
    <div className="App">
      <h1>Minesweeper React</h1>

       <MineGrid></MineGrid>
   
    </div>
  );
}

export default App;
