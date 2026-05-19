import "./App.css";
import MineGrid from "./components/MineGrid/MineGrid";
import SudokuBoard from "./components/SudokuBoard/SudokuBoard";
import { GameProvider } from "./contexts/GameProvider";
import { GameTypesKeys } from "./types/mineTypes";
import { useCallback, useEffect, useState } from "react";
import { SudokuDifficulty } from "./utils/sudokuSetup";

type GameChoice = "launcher" | "minesweeper" | "sudoku";

const minesweeperOptions: Array<{ id: GameTypesKeys; label: string }> = [
  { id: "test", label: "Test" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "expert", label: "Expert" },
];

const sudokuOptions: Array<{ id: SudokuDifficulty; label: string }> = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "expert", label: "Expert" },
];

const gameOptions: Array<{
  id: Exclude<GameChoice, "launcher">;
  title: string;
  description: string;
}> = [
  {
    id: "minesweeper",
    title: "Minesweeper",
    description: "Clear the board without hitting a mine.",
  },
  {
    id: "sudoku",
    title: "Sudoku",
    description: "A fresh puzzle board is coming next.",
  },
];

function App() {
  const [selectedGame, setSelectedGame] = useState<GameChoice>("launcher");
  const [selectedMinesweeperType, setSelectedMinesweeperType] =
    useState<GameTypesKeys>("beginner");
  const [selectedSudokuDifficulty, setSelectedSudokuDifficulty] =
    useState<SudokuDifficulty>("easy");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBackConfirmOpen, setIsBackConfirmOpen] = useState(false);

  useEffect(() => {
    setElapsedSeconds(0);
    setIsTimerRunning(selectedGame !== "launcher");
    setIsBackConfirmOpen(false);
  }, [selectedGame]);

  useEffect(() => {
    if (selectedGame === "launcher" || !isTimerRunning) {
      return;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isTimerRunning, selectedGame]);

  const handleGameEnd = useCallback((result: "win" | "lose") => {
    setIsTimerRunning(false);

    if (result === "lose") {
      setElapsedSeconds(0);
    }
  }, []);

  const handleGameRestart = useCallback(() => {
    setElapsedSeconds(0);
    setIsTimerRunning(true);
  }, []);

  const handleConfirmBack = () => {
    setIsBackConfirmOpen(false);
    setSelectedGame("launcher");
  };

  const selectedGameTitle =
    gameOptions.find((game) => game.id === selectedGame)?.title ?? "";

  const formattedTime = `${Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(elapsedSeconds % 60).toString().padStart(2, "0")}`;

  const renderGameHeader = () => {
    if (selectedGame === "launcher") {
      return null;
    }

    return (
      <header className="game-header">
        <button
          aria-label="Back to game chooser"
          className="header-back-button"
          onClick={() => setIsBackConfirmOpen(true)}
          type="button"
        >
          {"\u2039"}
        </button>
        <h1>{selectedGameTitle}</h1>
        <span className="header-timer" aria-label="Elapsed game time">
          {formattedTime}
        </span>
      </header>
    );
  };

  const renderGame = () => {
    if (selectedGame === "minesweeper") {
      return (
        <GameProvider initialGridSize={selectedMinesweeperType}>
          <MineGrid
            onGameEnd={handleGameEnd}
            onGameRestart={handleGameRestart}
          />
        </GameProvider>
      );
    }

    if (selectedGame === "sudoku") {
      return (
        <section className="placeholder-page" aria-label="Sudoku">
          <SudokuBoard
            difficulty={selectedSudokuDifficulty}
            onGameEnd={handleGameEnd}
            onGameRestart={handleGameRestart}
          />
        </section>
      );
    }

    return (
      <section className="game-launcher" aria-labelledby="game-launcher-title">
        <h1 id="game-launcher-title">Choose a Game</h1>
        <div className="game-list">
          {gameOptions.map((game) => {
            const gameSetupOptions =
              game.id === "minesweeper" ? minesweeperOptions : sudokuOptions;

            return (
              <article className="game-card" key={game.id}>
              <span>{game.title}</span>
              <small>{game.description}</small>
                <div className="game-option-list">
                  {gameSetupOptions.map((option) => (
                    <button
                      className="basic game-option-button"
                      key={option.id}
                      onClick={() => {
                        if (game.id === "minesweeper") {
                          setSelectedMinesweeperType(option.id as GameTypesKeys);
                        } else {
                          setSelectedSudokuDifficulty(
                            option.id as SudokuDifficulty
                          );
                        }

                        setSelectedGame(game.id);
                      }}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="App">
      {renderGameHeader()}
      {renderGame()}
      {isBackConfirmOpen && (
        <section
          className="confirm-back-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-back-title"
        >
          <div className="confirm-back-panel">
            <h2 id="confirm-back-title">Leave this game?</h2>
            <p>Your current game will end.</p>
            <div className="confirm-back-actions">
              <button
                className="basic"
                onClick={() => setIsBackConfirmOpen(false)}
                type="button"
              >
                Keep playing
              </button>
              <button
                className="basic confirm-back-danger"
                onClick={handleConfirmBack}
                type="button"
              >
                Leave game
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
