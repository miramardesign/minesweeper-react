import { useEffect, useMemo, useState } from "react";
import {
  getRandomSudokuGrid,
  SudokuDifficulty,
  SudokuDifficultyGivenCounts,
  SudokuGrid,
} from "../../utils/sudokuSetup";
import { playWrongAnswerSound } from "../../utils/soundEffects";
import GameEndOverlay from "../GameEndOverlay/GameEndOverlay";
import styles from "./SudokuBoard.module.scss";

type NumberPadOption = "delete" | number;
type UserCell = {
  value: number;
  isCorrect: boolean;
};
type UserEntries = Record<string, UserCell>;
type KeypadPosition = "left" | "center" | "right";

const numberPadRows = [
  ["delete", 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
] as NumberPadOption[][];
const keypadPositionStorageKey = "sudoku-keypad-position";
const statusBelowStorageKey = "sudoku-status-below-keypad";

const getCellKey = (iRow: number, iCol: number) => `${iRow}-${iCol}`;
const getDisplayText = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
const getSavedKeypadPosition = (): KeypadPosition => {
  const savedPosition = window.localStorage.getItem(keypadPositionStorageKey);

  return savedPosition === "left" ||
    savedPosition === "center" ||
    savedPosition === "right"
    ? savedPosition
    : "center";
};
const getSavedStatusBelowKeypad = () => {
  return window.localStorage.getItem(statusBelowStorageKey) === "true";
};

type SudokuBoardProps = {
  difficulty: SudokuDifficulty;
  onGameEnd: (result: "win" | "lose") => void;
  onGameRestart: () => void;
};

const getGivenCells = (givenCount: number) => {
  const cellKeys = Array.from({ length: 81 }, (_, index) =>
    getCellKey(Math.floor(index / 9), index % 9)
  );

  for (let i = cellKeys.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [cellKeys[i], cellKeys[randomIndex]] = [cellKeys[randomIndex], cellKeys[i]];
  }

  return new Set(cellKeys.slice(0, givenCount));
};

const SudokuBoard = ({
  difficulty,
  onGameEnd,
  onGameRestart,
}: SudokuBoardProps) => {
  const [puzzleId, setPuzzleId] = useState(0);
  const solutionRows: SudokuGrid = useMemo(
    () => getRandomSudokuGrid(),
    [puzzleId]
  );
  const givenCells = useMemo(
    () => getGivenCells(SudokuDifficultyGivenCounts[difficulty]),
    [difficulty, puzzleId]
  );
  const [selectedCell, setSelectedCell] = useState<{
    iRow: number;
    iCol: number;
  } | null>(null);
  const [userEntries, setUserEntries] = useState<UserEntries>({});
  const [mistakes, setMistakes] = useState(0);
  const [keypadPosition, setKeypadPosition] =
    useState<KeypadPosition>(getSavedKeypadPosition);
  const [isStatusBelowKeypad, setIsStatusBelowKeypad] = useState(
    getSavedStatusBelowKeypad
  );
  const hiddenCellCount = 81 - givenCells.size;
  const correctEntryCount = Object.values(userEntries).filter(
    (entry) => entry.isCorrect
  ).length;
  const hasWon = correctEntryCount === hiddenCellCount;
  const hasLost = mistakes >= 3;
  const isGameOver = hasWon || hasLost;

  useEffect(() => {
    if (!isGameOver) {
      return;
    }

    onGameEnd(hasWon ? "win" : "lose");
  }, [hasWon, isGameOver, onGameEnd]);

  useEffect(() => {
    window.localStorage.setItem(keypadPositionStorageKey, keypadPosition);
  }, [keypadPosition]);

  useEffect(() => {
    window.localStorage.setItem(
      statusBelowStorageKey,
      isStatusBelowKeypad.toString()
    );
  }, [isStatusBelowKeypad]);

  const resetPuzzle = () => {
    setPuzzleId((currentPuzzleId) => currentPuzzleId + 1);
    setSelectedCell(null);
    setUserEntries({});
    setMistakes(0);
    onGameRestart();
  };

  const redoPuzzle = () => {
    setSelectedCell(null);
    setUserEntries({});
    setMistakes(0);
    onGameRestart();
  };

  const renderStatusRow = () => (
    <div className={styles.statusRow}>
      <span>Difficulty: {getDisplayText(difficulty)}</span>
      <span>
        Mistakes {mistakes}/3
        <button
          aria-label={
            isStatusBelowKeypad
              ? "Move status above number pad"
              : "Move status below number pad"
          }
          className={styles.statusToggle}
          onClick={() =>
            setIsStatusBelowKeypad((currentStatusBelow) => !currentStatusBelow)
          }
          type="button"
        >
          {isStatusBelowKeypad ? "\u25B4" : "\u25BE"}
        </button>
      </span>
    </div>
  );

  const handleCellClick = (iRow: number, iCol: number) => {
    if (isGameOver) {
      return;
    }

    setSelectedCell({ iRow, iCol });
  };

  const handleNumberPadClick = (numberPadOption: NumberPadOption) => {
    if (!selectedCell || isGameOver) {
      return;
    }

    const cellKey = getCellKey(selectedCell.iRow, selectedCell.iCol);
    if (givenCells.has(cellKey)) {
      return;
    }

    if (numberPadOption === "delete") {
      setUserEntries((currentEntries) => {
        const nextEntries = { ...currentEntries };
        delete nextEntries[cellKey];
        return nextEntries;
      });
      return;
    }

    const isCorrect =
      solutionRows[selectedCell.iRow][selectedCell.iCol] === numberPadOption;

    setUserEntries((currentEntries) => ({
      ...currentEntries,
      [cellKey]: {
        value: numberPadOption,
        isCorrect,
      },
    }));

    if (!isCorrect) {
      playWrongAnswerSound();
      setMistakes((currentMistakes) => currentMistakes + 1);
    }
  };

  return (
    <article className={styles.sudoku}>
      <div className={styles.board} aria-label="Sudoku board">
        {solutionRows.map((row, iRow) => (
          <div className={styles.row} key={iRow}>
            {row.map((_, iCol) => {
              const cellKey = getCellKey(iRow, iCol);
              const isGiven = givenCells.has(cellKey);
              const userEntry = userEntries[cellKey];
              const isHighlighted =
                selectedCell?.iRow === iRow || selectedCell?.iCol === iCol;
              const isSelected =
                selectedCell?.iRow === iRow && selectedCell?.iCol === iCol;
              const displayValue = isGiven ? solutionRows[iRow][iCol] : userEntry?.value;

              return (
                <button
                  aria-label={`Sudoku cell row ${iRow + 1} column ${iCol + 1}`}
                  className={`${styles.cell} ${
                    isHighlighted ? styles.highlightedCell : ""
                  } ${isSelected ? styles.selectedCell : ""} ${
                    isGiven ? styles.givenCell : ""
                  } ${
                    userEntry?.isCorrect === true ? styles.correctCell : ""
                  } ${
                    userEntry?.isCorrect === false ? styles.incorrectCell : ""
                  }`}
                  key={iCol}
                  onClick={() => handleCellClick(iRow, iCol)}
                  type="button"
                >
                  {displayValue}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {!isStatusBelowKeypad && renderStatusRow()}

      <div
        className={`${styles.keypadWrap} ${
          isStatusBelowKeypad ? styles.keypadWrapRaised : ""
        }`}
      >
        {keypadPosition !== "left" && (
          <button
            aria-label={
              keypadPosition === "center"
                ? "Move number pad left"
                : "Move number pad to center"
            }
            className={`${styles.keypadShiftButton} ${styles.keypadShiftLeft}`}
            onClick={() =>
              setKeypadPosition(keypadPosition === "center" ? "left" : "center")
            }
            type="button"
          >
            {"\u2039"}
          </button>
        )}

        <div
          className={`${styles.numberPad} ${
            keypadPosition === "right" ? styles.numberPadRight : ""
          } ${
            keypadPosition === "left" ? styles.numberPadLeft : ""
          }`}
          aria-label="Sudoku number pad"
        >
          {numberPadRows.map((row) => (
            <div className={styles.numberPadRow} key={row.join("-")}>
              {row.map((numberPadOption) => (
                <button
                  aria-label={
                    numberPadOption === "delete"
                      ? "Delete selected Sudoku cell"
                      : `Enter ${numberPadOption}`
                  }
                  className={`${styles.numberButton} ${
                    numberPadOption === "delete" ? styles.deleteButton : ""
                  }`}
                  key={numberPadOption}
                  onClick={() => handleNumberPadClick(numberPadOption)}
                  type="button"
                >
                  {numberPadOption === "delete" ? "X" : numberPadOption}
                </button>
              ))}
            </div>
          ))}
        </div>

        {keypadPosition !== "right" && (
          <button
            aria-label={
              keypadPosition === "center"
                ? "Move number pad right"
                : "Move number pad to center"
            }
            className={`${styles.keypadShiftButton} ${styles.keypadShiftRight}`}
            onClick={() =>
              setKeypadPosition(
                keypadPosition === "center" ? "right" : "center"
              )
            }
            type="button"
          >
            {"\u203A"}
          </button>
        )}
      </div>

      {isStatusBelowKeypad && renderStatusRow()}

      {isGameOver && (
        <GameEndOverlay
          result={hasWon ? "win" : "lose"}
          title={hasWon ? "Solved!" : "Game over"}
          message={
            hasWon
              ? "The puzzle is complete."
              : "Three mistakes ends this round."
          }
          onPlayAgain={resetPuzzle}
          onRedo={redoPuzzle}
        />
      )}
    </article>
  );
};

export default SudokuBoard;
