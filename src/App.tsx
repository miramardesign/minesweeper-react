import "./App.css";
import MineGrid from "./components/MineGrid/MineGrid";
import SudokuBoard, {
  type SavedSudokuGame,
} from "./components/SudokuBoard/SudokuBoard";
import { registerPlugin } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { StatusBar } from "@capacitor/status-bar";
import { GameProvider } from "./contexts/GameProvider";
import { GameTypesKeys } from "./types/mineTypes";
import { useCallback, useEffect, useRef, useState } from "react";
import { SudokuDifficulty } from "./utils/sudokuSetup";

type GameChoice = "launcher" | "minesweeper" | "sudoku";
type MinesweeperProgress = Record<GameTypesKeys, number>;
type SudokuProgress = Record<SudokuDifficulty, number>;
type SharedTextResult = {
  text?: string;
};
type AndroidSharePlugin = {
  getSharedText: () => Promise<SharedTextResult>;
  clearSharedText: () => Promise<void>;
  addListener: (
    eventName: "shareReceived",
    listenerFunc: (result: SharedTextResult) => void
  ) => Promise<PluginListenerHandle>;
};

const AndroidShare = registerPlugin<AndroidSharePlugin>("AndroidShare");

const minesweeperOptions: Array<{ id: GameTypesKeys; label: string }> = [
  { id: "test", label: "Test" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "expert", label: "Expert" },
];
const minesweeperDifficultyOrder: GameTypesKeys[] = [
  "beginner",
  "intermediate",
  "expert",
];
const minesweeperWinsToUnlockNextDifficulty: MinesweeperProgress = {
  test: 0,
  beginner: 5,
  intermediate: 10,
  expert: 15,
};
const minesweeperProgressStorageKey = "minesweeper-progression";
const defaultMinesweeperProgress: MinesweeperProgress = {
  test: 0,
  beginner: 0,
  intermediate: 0,
  expert: 0,
};

const sudokuOptions: Array<{ id: SudokuDifficulty; label: string }> = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "expert", label: "Expert" },
];
const sudokuDifficultyOrder = sudokuOptions.map((option) => option.id);
const sudokuWinsToUnlockNextDifficulty: SudokuProgress = {
  easy: 5,
  medium: 10,
  hard: 15,
  expert: 20,
};
const sudokuProgressStorageKey = "sudoku-progression";
const unfinishedSudokuGameStorageKey = "sudoku-unfinished-game-v1";
const defaultSudokuProgress: SudokuProgress = {
  easy: 0,
  medium: 0,
  hard: 0,
  expert: 0,
};

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
    description: "You favorite decoding game",
  },
];

const getSavedSudokuProgress = (): SudokuProgress => {
  const savedProgress = window.localStorage.getItem(sudokuProgressStorageKey);

  if (!savedProgress) {
    return defaultSudokuProgress;
  }

  try {
    const parsedProgress = JSON.parse(savedProgress) as Partial<SudokuProgress>;

    return sudokuDifficultyOrder.reduce<SudokuProgress>(
      (progress, difficulty) => ({
        ...progress,
        [difficulty]:
          typeof parsedProgress[difficulty] === "number"
            ? parsedProgress[difficulty]
            : 0,
      }),
      { ...defaultSudokuProgress }
    );
  } catch {
    return defaultSudokuProgress;
  }
};

const isSavedSudokuDifficulty = (difficulty: unknown): difficulty is SudokuDifficulty =>
  typeof difficulty === "string" &&
  sudokuDifficultyOrder.includes(difficulty as SudokuDifficulty);

const isSavedSudokuGrid = (grid: unknown): grid is number[][] =>
  Array.isArray(grid) &&
  grid.length === 9 &&
  grid.every(
    (row) =>
      Array.isArray(row) &&
      row.length === 9 &&
      row.every((value) => Number.isInteger(value) && value >= 1 && value <= 9)
  );

const getSavedUnfinishedSudokuGame = (): SavedSudokuGame | null => {
  const savedGame = window.localStorage.getItem(unfinishedSudokuGameStorageKey);

  if (!savedGame) {
    return null;
  }

  try {
    const parsedGame = JSON.parse(savedGame) as Partial<SavedSudokuGame>;

    if (
      !isSavedSudokuDifficulty(parsedGame.difficulty) ||
      !isSavedSudokuGrid(parsedGame.solutionRows) ||
      !Array.isArray(parsedGame.givenCellKeys) ||
      typeof parsedGame.userEntries !== "object" ||
      parsedGame.userEntries === null ||
      typeof parsedGame.mistakes !== "number" ||
      typeof parsedGame.elapsedSeconds !== "number" ||
      typeof parsedGame.updatedAt !== "string"
    ) {
      return null;
    }

    return {
      difficulty: parsedGame.difficulty,
      elapsedSeconds: Math.max(0, Math.floor(parsedGame.elapsedSeconds)),
      givenCellKeys: parsedGame.givenCellKeys.filter(
        (cellKey): cellKey is string => typeof cellKey === "string"
      ),
      mistakes: Math.max(0, Math.min(3, Math.floor(parsedGame.mistakes))),
      solutionRows: parsedGame.solutionRows,
      updatedAt: parsedGame.updatedAt,
      userEntries: parsedGame.userEntries,
    };
  } catch {
    return null;
  }
};

const getSavedSudokuGameAgeLabel = (updatedAt: string) => {
  const updatedTime = new Date(updatedAt).getTime();

  if (Number.isNaN(updatedTime)) {
    return "unfinished game";
  }

  const elapsedDays = Math.floor(
    (Date.now() - updatedTime) / (1000 * 60 * 60 * 24)
  );

  if (elapsedDays <= 0) {
    return "played today";
  }

  if (elapsedDays === 1) {
    return "played yesterday";
  }

  return `played ${elapsedDays} days ago`;
};

const getSavedMinesweeperProgress = (): MinesweeperProgress => {
  const savedProgress = window.localStorage.getItem(
    minesweeperProgressStorageKey
  );

  if (!savedProgress) {
    return defaultMinesweeperProgress;
  }

  try {
    const parsedProgress = JSON.parse(
      savedProgress
    ) as Partial<MinesweeperProgress>;

    return minesweeperOptions.reduce<MinesweeperProgress>(
      (progress, option) => ({
        ...progress,
        [option.id]:
          typeof parsedProgress[option.id] === "number"
            ? parsedProgress[option.id]
            : 0,
      }),
      { ...defaultMinesweeperProgress }
    );
  } catch {
    return defaultMinesweeperProgress;
  }
};

const getIsMinesweeperDifficultyUnlocked = (
  difficulty: GameTypesKeys,
  progress: MinesweeperProgress
) => {
  if (difficulty === "test") {
    return true;
  }

  const difficultyIndex = minesweeperDifficultyOrder.indexOf(difficulty);

  if (difficultyIndex <= 0) {
    return true;
  }

  const previousDifficulty = minesweeperDifficultyOrder[difficultyIndex - 1];

  return (
    progress[previousDifficulty] >=
    minesweeperWinsToUnlockNextDifficulty[previousDifficulty]
  );
};

const getIsSudokuDifficultyUnlocked = (
  difficulty: SudokuDifficulty,
  progress: SudokuProgress
) => {
  const difficultyIndex = sudokuDifficultyOrder.indexOf(difficulty);

  if (difficultyIndex <= 0) {
    return true;
  }

  const previousDifficulty = sudokuDifficultyOrder[difficultyIndex - 1];

  return (
    progress[previousDifficulty] >=
    sudokuWinsToUnlockNextDifficulty[previousDifficulty]
  );
};

const getNextSudokuDifficulty = (difficulty: SudokuDifficulty) => {
  const difficultyIndex = sudokuDifficultyOrder.indexOf(difficulty);

  return sudokuDifficultyOrder[difficultyIndex + 1] ?? null;
};

const getNextMinesweeperDifficulty = (difficulty: GameTypesKeys) => {
  const difficultyIndex = minesweeperDifficultyOrder.indexOf(difficulty);

  return difficultyIndex === -1
    ? null
    : minesweeperDifficultyOrder[difficultyIndex + 1] ?? null;
};

const getSudokuDifficultyLabel = (difficulty: SudokuDifficulty) =>
  sudokuOptions.find((option) => option.id === difficulty)?.label ??
  difficulty;

const getMinesweeperDifficultyLabel = (difficulty: GameTypesKeys) =>
  minesweeperOptions.find((option) => option.id === difficulty)?.label ??
  difficulty;

const getYouTubeEmbedUrl = (sharedText: string) => {
  const urlMatch = sharedText.match(/https?:\/\/[^\s]+/i);

  if (!urlMatch) {
    return null;
  }

  try {
    const url = new URL(urlMatch[0]);
    const hostname = url.hostname.replace(/^www\./, "");
    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com"
    ) {
      const pathParts = url.pathname.split("/").filter(Boolean);

      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else if (
        pathParts[0] === "shorts" ||
        pathParts[0] === "embed" ||
        pathParts[0] === "live"
      ) {
        videoId = pathParts[1] ?? null;
      }
    }

    return videoId && /^[a-zA-Z0-9_-]{6,}$/.test(videoId)
      ? `https://www.youtube.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
};

function App() {
  const [selectedGame, setSelectedGame] = useState<GameChoice>("launcher");
  const [selectedMinesweeperType, setSelectedMinesweeperType] =
    useState<GameTypesKeys>("beginner");
  const [selectedSudokuDifficulty, setSelectedSudokuDifficulty] =
    useState<SudokuDifficulty>("easy");
  const [minesweeperProgress, setMinesweeperProgress] =
    useState<MinesweeperProgress>(getSavedMinesweeperProgress);
  const [sudokuProgress, setSudokuProgress] = useState<SudokuProgress>(
    getSavedSudokuProgress
  );
  const [savedSudokuGame, setSavedSudokuGame] = useState<SavedSudokuGame | null>(
    getSavedUnfinishedSudokuGame
  );
  const [initialSudokuGame, setInitialSudokuGame] =
    useState<SavedSudokuGame | null>(null);
  const [unlockedMinesweeperDifficulty, setUnlockedMinesweeperDifficulty] =
    useState<GameTypesKeys | null>(null);
  const [unlockedSudokuDifficulty, setUnlockedSudokuDifficulty] =
    useState<SudokuDifficulty | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAppFocused, setIsAppFocused] = useState(
    () => !document.hidden && document.hasFocus()
  );
  const [isBackConfirmOpen, setIsBackConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSudokuLandscape, setIsSudokuLandscape] = useState(false);
  const [sharedYouTubeEmbedUrl, setSharedYouTubeEmbedUrl] = useState<
    string | null
  >(null);
  const [gameResetKey, setGameResetKey] = useState(0);
  const selectedGameRef = useRef(selectedGame);
  const selectedMinesweeperTypeRef = useRef(selectedMinesweeperType);
  const selectedSudokuDifficultyRef = useRef(selectedSudokuDifficulty);
  const minesweeperProgressRef = useRef(minesweeperProgress);
  const sudokuProgressRef = useRef(sudokuProgress);
  const pendingSudokuResumeRef = useRef<SavedSudokuGame | null>(null);

  selectedGameRef.current = selectedGame;
  selectedMinesweeperTypeRef.current = selectedMinesweeperType;
  selectedSudokuDifficultyRef.current = selectedSudokuDifficulty;
  minesweeperProgressRef.current = minesweeperProgress;
  sudokuProgressRef.current = sudokuProgress;

  useEffect(() => {
    const pendingSudokuResume = pendingSudokuResumeRef.current;

    setElapsedSeconds(
      selectedGame === "sudoku" && pendingSudokuResume
        ? pendingSudokuResume.elapsedSeconds
        : 0
    );
    pendingSudokuResumeRef.current = null;
    setIsTimerRunning(selectedGame !== "launcher");
    setIsBackConfirmOpen(false);
    setIsResetConfirmOpen(false);
    setIsSudokuLandscape(
      selectedGame === "sudoku" && sharedYouTubeEmbedUrl !== null
    );
    setUnlockedMinesweeperDifficulty(null);
    setUnlockedSudokuDifficulty(null);
  }, [selectedGame, sharedYouTubeEmbedUrl]);

  useEffect(() => {
    const handleSharedText = (text?: string) => {
      if (!text) {
        return;
      }

      const embedUrl = getYouTubeEmbedUrl(text);

      if (!embedUrl) {
        return;
      }

      setSharedYouTubeEmbedUrl(embedUrl);
      setSelectedGame("sudoku");
      setIsSudokuLandscape(true);
    };

    let shareListener: PluginListenerHandle | null = null;

    AndroidShare.getSharedText()
      .then((result) => handleSharedText(result.text))
      .catch((error) => {
        console.warn("Android share target is unavailable.", error);
      });

    AndroidShare.addListener("shareReceived", (result) => {
      handleSharedText(result.text);
    })
      .then((listener) => {
        shareListener = listener;
      })
      .catch((error) => {
        console.warn("Android share listener is unavailable.", error);
      });

    return () => {
      shareListener?.remove().catch((error) => {
        console.warn("Android share listener cleanup failed.", error);
      });
    };
  }, []);

  useEffect(() => {
    const lockScreenOrientation = async () => {
      try {
        await ScreenOrientation.lock({
          orientation:
            selectedGame === "sudoku" && isSudokuLandscape
              ? "landscape"
              : "portrait",
        });
      } catch (error) {
        console.warn("Screen orientation lock is unavailable.", error);
      }
    };

    lockScreenOrientation();
  }, [isSudokuLandscape, selectedGame]);

  useEffect(() => {
    const shouldHideStatusBar =
      selectedGame === "sudoku" && isSudokuLandscape;

    const updateStatusBar = async () => {
      try {
        if (shouldHideStatusBar) {
          await StatusBar.hide();
          return;
        }

        await StatusBar.show();
      } catch (error) {
        console.warn("Status bar control is unavailable.", error);
      }
    };

    updateStatusBar();

    return () => {
      StatusBar.show().catch((error) => {
        console.warn("Status bar restore is unavailable.", error);
      });
    };
  }, [isSudokuLandscape, selectedGame]);

  useEffect(() => {
    const updateAppFocus = () => {
      setIsAppFocused(!document.hidden && document.hasFocus());
    };

    document.addEventListener("visibilitychange", updateAppFocus);
    window.addEventListener("focus", updateAppFocus);
    window.addEventListener("blur", updateAppFocus);

    return () => {
      document.removeEventListener("visibilitychange", updateAppFocus);
      window.removeEventListener("focus", updateAppFocus);
      window.removeEventListener("blur", updateAppFocus);
    };
  }, []);

  useEffect(() => {
    if (selectedGame === "launcher" || !isTimerRunning || !isAppFocused) {
      return;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isAppFocused, isTimerRunning, selectedGame]);

  const handleGameEnd = useCallback((result: "win" | "lose") => {
    setIsTimerRunning(false);

    if (result === "lose") {
      setElapsedSeconds(0);
      return;
    }

    if (selectedGameRef.current === "sudoku") {
      window.localStorage.removeItem(unfinishedSudokuGameStorageKey);
      setSavedSudokuGame(null);
      setInitialSudokuGame(null);

      const currentDifficulty = selectedSudokuDifficultyRef.current;
      const currentProgress = sudokuProgressRef.current;
      const nextProgress = {
        ...currentProgress,
        [currentDifficulty]: currentProgress[currentDifficulty] + 1,
      };
      const nextDifficulty = getNextSudokuDifficulty(currentDifficulty);
      const unlockRequirement =
        sudokuWinsToUnlockNextDifficulty[currentDifficulty];

      if (
        nextDifficulty &&
        currentProgress[currentDifficulty] < unlockRequirement &&
        nextProgress[currentDifficulty] >= unlockRequirement
      ) {
        setUnlockedSudokuDifficulty(nextDifficulty);
      } else {
        setUnlockedSudokuDifficulty(null);
      }

      sudokuProgressRef.current = nextProgress;
      window.localStorage.setItem(
        sudokuProgressStorageKey,
        JSON.stringify(nextProgress)
      );
      setSudokuProgress(nextProgress);
    }

    if (selectedGameRef.current === "minesweeper") {
      const currentDifficulty = selectedMinesweeperTypeRef.current;
      const currentProgress = minesweeperProgressRef.current;
      const nextProgress = {
        ...currentProgress,
        [currentDifficulty]: currentProgress[currentDifficulty] + 1,
      };
      const nextDifficulty = getNextMinesweeperDifficulty(currentDifficulty);
      const unlockRequirement =
        minesweeperWinsToUnlockNextDifficulty[currentDifficulty];

      if (
        nextDifficulty &&
        currentProgress[currentDifficulty] < unlockRequirement &&
        nextProgress[currentDifficulty] >= unlockRequirement
      ) {
        setUnlockedMinesweeperDifficulty(nextDifficulty);
      } else {
        setUnlockedMinesweeperDifficulty(null);
      }

      minesweeperProgressRef.current = nextProgress;
      window.localStorage.setItem(
        minesweeperProgressStorageKey,
        JSON.stringify(nextProgress)
      );
      setMinesweeperProgress(nextProgress);
    }
  }, []);

  const handleGameRestart = useCallback(() => {
    setInitialSudokuGame(null);
    setElapsedSeconds(0);
    setIsTimerRunning(true);
    setUnlockedMinesweeperDifficulty(null);
    setUnlockedSudokuDifficulty(null);
  }, []);

  const handleSudokuProgressSave = useCallback(
    (savedGame: SavedSudokuGame | null) => {
      if (!savedGame) {
        window.localStorage.removeItem(unfinishedSudokuGameStorageKey);
        setSavedSudokuGame(null);
        return;
      }

      window.localStorage.setItem(
        unfinishedSudokuGameStorageKey,
        JSON.stringify(savedGame)
      );
      setSavedSudokuGame(savedGame);
    },
    []
  );

  const startNewSudokuGame = (difficulty: SudokuDifficulty) => {
    window.localStorage.removeItem(unfinishedSudokuGameStorageKey);
    pendingSudokuResumeRef.current = null;
    setSavedSudokuGame(null);
    setInitialSudokuGame(null);
    setSelectedSudokuDifficulty(difficulty);
    setGameResetKey((currentKey) => currentKey + 1);
    setSelectedGame("sudoku");
  };

  const continueSavedSudokuGame = () => {
    if (!savedSudokuGame) {
      return;
    }

    pendingSudokuResumeRef.current = savedSudokuGame;
    setInitialSudokuGame(savedSudokuGame);
    setSelectedSudokuDifficulty(savedSudokuGame.difficulty);
    setGameResetKey((currentKey) => currentKey + 1);
    setSelectedGame("sudoku");
  };

  const handleUnlockedMinesweeperRestart = useCallback(() => {
    if (unlockedMinesweeperDifficulty) {
      setSelectedMinesweeperType(unlockedMinesweeperDifficulty);
    }

    setElapsedSeconds(0);
    setIsTimerRunning(true);
    setUnlockedMinesweeperDifficulty(null);
  }, [unlockedMinesweeperDifficulty]);

  const handleUnlockedSudokuRestart = useCallback(() => {
    if (unlockedSudokuDifficulty) {
      setSelectedSudokuDifficulty(unlockedSudokuDifficulty);
    }

    setInitialSudokuGame(null);
    setElapsedSeconds(0);
    setIsTimerRunning(true);
    setUnlockedSudokuDifficulty(null);
  }, [unlockedSudokuDifficulty]);

  const handleConfirmBack = () => {
    setIsBackConfirmOpen(false);
    setSelectedGame("launcher");
  };

  const handleConfirmReset = () => {
    setIsResetConfirmOpen(false);
    setInitialSudokuGame(null);
    setElapsedSeconds(0);
    setIsTimerRunning(true);
    setUnlockedMinesweeperDifficulty(null);
    setUnlockedSudokuDifficulty(null);
    setGameResetKey((currentKey) => currentKey + 1);
  };

  const selectedGameTitle =
    gameOptions.find((game) => game.id === selectedGame)?.title ?? "";

  const formattedTime = `${Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(elapsedSeconds % 60).toString().padStart(2, "0")}`;
  const isSudokuGame = selectedGame === "sudoku";

  const renderGameHeader = () => {
    if (selectedGame === "launcher") {
      return null;
    }

    return (
      <header
        className={`game-header ${
          isSudokuLandscape ? "game-header-sudoku-landscape" : ""
        }`}
      >
        <button
          aria-label="Back to game chooser"
          className="header-back-button"
          onClick={() => setIsBackConfirmOpen(true)}
          type="button"
        >
          {"\u2039"}
        </button>
        <h1 className="game-title">
          {isSudokuGame ? (
            <>
              <span>{isSudokuLandscape ? "S" : "Sudoku"}</span>
              <i
                aria-hidden="true"
                className="bi bi-grid-3x3 game-title-icon"
              />
            </>
          ) : (
            selectedGameTitle
          )}
        </h1>
        <div className="header-timer-wrap">
          <span className="header-timer" aria-label="Elapsed game time">
            {formattedTime}
          </span>
          <button
            aria-label={`Restart ${selectedGameTitle}`}
            className="header-reset-button"
            onClick={() => setIsResetConfirmOpen(true)}
            type="button"
          >
            <i aria-hidden="true" className="bi bi-arrow-clockwise" />
          </button>
          {isSudokuGame && (
            <button
              aria-label={
                isSudokuLandscape
                  ? "Switch Sudoku to portrait layout"
                  : "Switch Sudoku to landscape layout"
              }
              className="header-layout-button"
              onClick={() =>
                setIsSudokuLandscape(
                  (currentIsSudokuLandscape) => !currentIsSudokuLandscape
                )
              }
              type="button"
            >
              <i
                aria-hidden="true"
                className={`bi ${
                  isSudokuLandscape ? "bi-phone" : "bi-phone-landscape"
                }`}
              />
            </button>
          )}
        </div>
      </header>
    );
  };

  const renderGame = () => {
    if (selectedGame === "minesweeper") {
      return (
        <GameProvider
          initialGridSize={selectedMinesweeperType}
          key={`minesweeper-${gameResetKey}-${selectedMinesweeperType}`}
        >
          <MineGrid
            unlockedDifficultyLabel={
              unlockedMinesweeperDifficulty
                ? getMinesweeperDifficultyLabel(unlockedMinesweeperDifficulty)
                : undefined
            }
            onGameEnd={handleGameEnd}
            onGameRestart={handleGameRestart}
            onUnlockedGameRestart={handleUnlockedMinesweeperRestart}
          />
        </GameProvider>
      );
    }

    if (selectedGame === "sudoku") {
      return (
        <section
          className={`placeholder-page ${
            isSudokuLandscape ? "placeholder-page-sudoku-landscape" : ""
          }`}
          aria-label="Sudoku"
        >
          <SudokuBoard
            difficulty={selectedSudokuDifficulty}
            elapsedSeconds={elapsedSeconds}
            initialSavedGame={initialSudokuGame}
            isLandscape={isSudokuLandscape}
            key={`sudoku-${gameResetKey}-${selectedSudokuDifficulty}`}
            sharedYouTubeEmbedUrl={sharedYouTubeEmbedUrl}
            unlockedDifficultyLabel={
              unlockedSudokuDifficulty
                ? getSudokuDifficultyLabel(unlockedSudokuDifficulty)
                : undefined
            }
            onGameEnd={handleGameEnd}
            onGameRestart={handleGameRestart}
            onProgressSave={handleSudokuProgressSave}
            onUnlockedGameRestart={handleUnlockedSudokuRestart}
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
                {game.id === "sudoku" && savedSudokuGame && (
                  <button
                    className="basic continue-game-button"
                    onClick={continueSavedSudokuGame}
                    type="button"
                  >
                    <span>Continue game</span>
                    <small>
                      {getSudokuDifficultyLabel(savedSudokuGame.difficulty)} ·{" "}
                      {getSavedSudokuGameAgeLabel(savedSudokuGame.updatedAt)}
                    </small>
                  </button>
                )}
                <div className="game-option-list">
                  {gameSetupOptions.map((option) => {
                    const isMinesweeperOption = game.id === "minesweeper";
                    const isSudokuOption = game.id === "sudoku";
                    const minesweeperOptionId = option.id as GameTypesKeys;
                    const sudokuOptionId = option.id as SudokuDifficulty;
                    const isLocked = isMinesweeperOption
                      ? !getIsMinesweeperDifficultyUnlocked(
                          minesweeperOptionId,
                          minesweeperProgress
                        )
                      : isSudokuOption &&
                        !getIsSudokuDifficultyUnlocked(
                          sudokuOptionId,
                          sudokuProgress
                        );
                    const previousMinesweeperDifficulty =
                      isMinesweeperOption &&
                      minesweeperDifficultyOrder[
                        minesweeperDifficultyOrder.indexOf(
                          minesweeperOptionId
                        ) - 1
                      ];
                    const previousSudokuDifficulty =
                      isSudokuOption &&
                      sudokuDifficultyOrder[
                        sudokuDifficultyOrder.indexOf(sudokuOptionId) - 1
                      ];
                    const unlockRequirement = previousMinesweeperDifficulty
                      ? minesweeperWinsToUnlockNextDifficulty[
                          previousMinesweeperDifficulty
                        ]
                      : previousSudokuDifficulty
                      ? sudokuWinsToUnlockNextDifficulty[
                          previousSudokuDifficulty
                        ]
                      : 0;
                    const lockedMessage = `Complete ${unlockRequirement} games on the previous ${game.title} difficulty to unlock.`;
                    const isUnlockedProgressionOption =
                      (isMinesweeperOption || isSudokuOption) && !isLocked;

                    return (
                      <button
                        aria-label={
                          isLocked
                            ? `${option.label} locked. ${lockedMessage}`
                            : isUnlockedProgressionOption
                            ? `${option.label} unlocked`
                            : option.label
                        }
                        className="basic game-option-button"
                        disabled={isLocked}
                        key={option.id}
                        onClick={() => {
                          if (game.id === "minesweeper") {
                            setSelectedMinesweeperType(
                              option.id as GameTypesKeys
                            );
                            setSelectedGame(game.id);
                          } else {
                            startNewSudokuGame(option.id as SudokuDifficulty);
                          }
                        }}
                        title={
                          isLocked ? lockedMessage : undefined
                        }
                        type="button"
                      >
                        {option.label}
                        {isLocked ? (
                          <span className="game-option-lock" aria-hidden="true">
                            {" "}
                            {"\uD83D\uDD12"}
                          </span>
                        ) : isUnlockedProgressionOption ? (
                          <span className="game-option-lock" aria-hidden="true">
                            {" "}
                            {"\uD83D\uDD13"}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div
      className={`App ${
        selectedGame === "sudoku" && !isSudokuLandscape
          ? "App-sudoku-portrait debugGreenYellow"
          : ""
      } ${isSudokuLandscape ? "App-sudoku-landscape" : ""}`}
    >
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
      {isResetConfirmOpen && (
        <section
          className="confirm-back-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-reset-title"
        >
          <div className="confirm-back-panel">
            <h2 id="confirm-reset-title">Restart this game?</h2>
            <p>Your current board will reset.</p>
            <div className="confirm-back-actions">
              <button
                className="basic"
                onClick={() => setIsResetConfirmOpen(false)}
                type="button"
              >
                Keep playing
              </button>
              <button
                className="basic confirm-back-danger"
                onClick={handleConfirmReset}
                type="button"
              >
                Restart
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
