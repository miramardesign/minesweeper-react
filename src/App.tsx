import { useState } from "react";
import "./App.css";
import MineGrid from "./components/MineGrid/MineGrid";
import { GameProvider } from "./contexts/GameProvider";

function App() {
  return (
    <div className="App">
      <h1>Minesweeper React</h1>

      <GameProvider>
        <MineGrid />
      </GameProvider>
    </div>
  );
}

export default App;
