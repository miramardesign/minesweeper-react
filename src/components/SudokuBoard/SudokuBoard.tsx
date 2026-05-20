import { useEffect, useMemo, useRef, useState } from "react";
import {
  getRandomSudokuGrid,
  SudokuDifficulty,
  SudokuDifficultyGivenCounts,
  SudokuGrid,
} from "../../utils/sudokuSetup";
import {
  playPositiveBeepSound,
  playWrongAnswerSound,
} from "../../utils/soundEffects";
import GameEndOverlay from "../GameEndOverlay/GameEndOverlay";
import styles from "./SudokuBoard.module.scss";

type NumberPadOption = "delete" | number;
type UserCell = {
  value: number;
  isCorrect: boolean;
};
type UserEntries = Record<string, UserCell>;
type KeypadPosition = "left" | "center" | "right";
type KeypadVerticalPosition = 0 | 1 | 2 | 3;

const numberPadRows = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, "delete"],
] as NumberPadOption[][];
const keypadPositionStorageKey = "sudoku-keypad-position";
const keypadVerticalPositionStorageKey = "sudoku-keypad-vertical-position";
const keypadVerticalPositions: KeypadVerticalPosition[] = [0, 1, 2, 3];

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
const getSavedKeypadVerticalPosition = (): KeypadVerticalPosition => {
  const savedPosition = Number(
    window.localStorage.getItem(keypadVerticalPositionStorageKey)
  );

  return keypadVerticalPositions.includes(
    savedPosition as KeypadVerticalPosition
  )
    ? (savedPosition as KeypadVerticalPosition)
    : 1;
};

type SudokuBoardProps = {
  difficulty: SudokuDifficulty;
  unlockedDifficultyLabel?: string;
  onGameEnd: (result: "win" | "lose") => void;
  onGameRestart: () => void;
  onUnlockedGameRestart?: () => void;
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
  unlockedDifficultyLabel,
  onGameEnd,
  onGameRestart,
  onUnlockedGameRestart,
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
  const [selectedKeypadNumber, setSelectedKeypadNumber] = useState<
    number | null
  >(null);
  const [userEntries, setUserEntries] = useState<UserEntries>({});
  const [mistakes, setMistakes] = useState(0);
  const [completedNumberNotification, setCompletedNumberNotification] =
    useState<number | null>(null);
  const [keypadPosition, setKeypadPosition] =
    useState<KeypadPosition>(getSavedKeypadPosition);
  const [keypadVerticalPosition, setKeypadVerticalPosition] = useState(
    getSavedKeypadVerticalPosition
  );
  const hasReportedGameEnd = useRef(false);
  const previousCompletedNumbers = useRef<Set<number>>(new Set());
  const hiddenCellCount = 81 - givenCells.size;
  const correctEntryCount = Object.values(userEntries).filter(
    (entry) => entry.isCorrect
  ).length;
  const completedNumbers = useMemo(() => {
    const numberCounts = new Map<number, number>();

    solutionRows.forEach((row, iRow) => {
      row.forEach((solutionValue, iCol) => {
        const cellKey = getCellKey(iRow, iCol);
        const userEntry = userEntries[cellKey];

        if (givenCells.has(cellKey) || userEntry?.isCorrect) {
          numberCounts.set(
            solutionValue,
            (numberCounts.get(solutionValue) ?? 0) + 1
          );
        }
      });
    });

    return new Set(
      Array.from(numberCounts.entries())
        .filter(([, count]) => count === 9)
        .map(([value]) => value)
    );
  }, [givenCells, solutionRows, userEntries]);
  const hasWon = correctEntryCount === hiddenCellCount;
  const hasLost = mistakes >= 3;
  const isGameOver = hasWon || hasLost;

  useEffect(() => {
    if (!isGameOver) {
      hasReportedGameEnd.current = false;
      return;
    }

    if (hasReportedGameEnd.current) {
      return;
    }

    hasReportedGameEnd.current = true;
    onGameEnd(hasWon ? "win" : "lose");
  }, [hasWon, isGameOver, onGameEnd]);

  useEffect(() => {
    window.localStorage.setItem(keypadPositionStorageKey, keypadPosition);
  }, [keypadPosition]);

  useEffect(() => {
    window.localStorage.setItem(
      keypadVerticalPositionStorageKey,
      keypadVerticalPosition.toString()
    );
  }, [keypadVerticalPosition]);

  useEffect(() => {
    const newlyCompletedNumber = Array.from(completedNumbers).find(
      (completedNumber) =>
        !previousCompletedNumbers.current.has(completedNumber)
    );

    previousCompletedNumbers.current = new Set(completedNumbers);

    if (newlyCompletedNumber === undefined) {
      return;
    }

    setCompletedNumberNotification(newlyCompletedNumber);
    playPositiveBeepSound();

    const notificationTimer = window.setTimeout(() => {
      setCompletedNumberNotification(null);
    }, 1400);

    return () => window.clearTimeout(notificationTimer);
  }, [completedNumbers]);

  const resetPuzzle = () => {
    setPuzzleId((currentPuzzleId) => currentPuzzleId + 1);
    setSelectedCell(null);
    setSelectedKeypadNumber(null);
    setUserEntries({});
    setMistakes(0);
    setCompletedNumberNotification(null);
    previousCompletedNumbers.current = new Set();

    if (unlockedDifficultyLabel && onUnlockedGameRestart) {
      onUnlockedGameRestart();
      return;
    }

    onGameRestart();
  };

  const redoPuzzle = () => {
    setSelectedCell(null);
    setSelectedKeypadNumber(null);
    setUserEntries({});
    setMistakes(0);
    setCompletedNumberNotification(null);
    previousCompletedNumbers.current = new Set();
    onGameRestart();
  };

  const renderStatusRow = () => (
    <div className={styles.statusRow}>
      <span>Difficulty: {getDisplayText(difficulty)}</span>
      <span>Mistakes {mistakes}/3</span>
    </div>
  );

  const moveKeypadUp = () => {
    setKeypadVerticalPosition((currentPosition) =>
      Math.max(0, currentPosition - 1) as KeypadVerticalPosition
    );
  };

  const moveKeypadDown = () => {
    setKeypadVerticalPosition((currentPosition) =>
      Math.min(3, currentPosition + 1) as KeypadVerticalPosition
    );
  };

  const renderKeypad = () => (
    <div
      className={`${styles.keypadStack} ${
        styles[`keypadStackStep${keypadVerticalPosition}`]
      }`}
    >
      {keypadVerticalPosition > 0 && (
        <button
          aria-label="Move number pad up"
          className={styles.keypadVerticalButton}
          onClick={moveKeypadUp}
          type="button"
        >
          <span className={styles.chevronUp}>{"\u2039"}</span>
        </button>
      )}

      <div className={styles.keypadWrap}>
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
          } ${keypadPosition === "left" ? styles.numberPadLeft : ""}`}
          aria-label="Sudoku number pad"
        >
          {numberPadRows.map((row) => (
            <div className={styles.numberPadRow} key={row.join("-")}>
              {row.map((numberPadOption) => {
                const isCompletedNumber =
                  typeof numberPadOption === "number" &&
                  completedNumbers.has(numberPadOption);
                const isSelectedKeypadNumber =
                  typeof numberPadOption === "number" &&
                  numberPadOption === selectedKeypadNumber;

                return (
                  <button
                    aria-label={
                      numberPadOption === "delete"
                        ? "Delete selected Sudoku cell"
                        : isCompletedNumber
                        ? `${numberPadOption} completed`
                        : isSelectedKeypadNumber
                        ? `${numberPadOption} selected`
                        : `Enter ${numberPadOption}`
                    }
                    aria-pressed={
                      typeof numberPadOption === "number"
                        ? isSelectedKeypadNumber
                        : undefined
                    }
                    className={`${styles.numberButton} ${
                      numberPadOption === "delete" ? styles.deleteButton : ""
                    } ${
                      isCompletedNumber ? styles.completedNumberButton : ""
                    } ${
                      isSelectedKeypadNumber
                        ? styles.selectedNumberButton
                        : ""
                    }`}
                    disabled={isCompletedNumber}
                    key={numberPadOption}
                    onClick={() => handleNumberPadClick(numberPadOption)}
                    type="button"
                  >
                    {isCompletedNumber
                      ? "\u2713"
                      : numberPadOption === "delete"
                      ? <span className={styles.deleteIcon}>X</span>
                      : numberPadOption}
                  </button>
                );
              })}
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

      {keypadVerticalPosition < 3 && (
        <button
          aria-label="Move number pad down"
          className={styles.keypadVerticalButton}
          onClick={moveKeypadDown}
          type="button"
        >
          <span className={styles.chevronDown}>{"\u2039"}</span>
        </button>
      )}
    </div>
  );

  const handleCellClick = (iRow: number, iCol: number) => {
    if (isGameOver) {
      return;
    }

    setSelectedCell({ iRow, iCol });

    const cellKey = getCellKey(iRow, iCol);
    const displayValue = givenCells.has(cellKey)
      ? solutionRows[iRow][iCol]
      : userEntries[cellKey]?.value;

    if (displayValue !== undefined) {
      setSelectedKeypadNumber(displayValue);
    }
  };

  const handleNumberPadClick = (numberPadOption: NumberPadOption) => {
    if (!selectedCell || isGameOver) {
      return;
    }

    const cellKey = getCellKey(selectedCell.iRow, selectedCell.iCol);
    const currentEntry = userEntries[cellKey];

    if (givenCells.has(cellKey)) {
      return;
    }

    if (currentEntry?.isCorrect) {
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

    setSelectedKeypadNumber(numberPadOption);

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

  const selectedCellKey = selectedCell
    ? getCellKey(selectedCell.iRow, selectedCell.iCol)
    : null;
  const selectedDisplayValue = selectedCell
    ? givenCells.has(selectedCellKey!)
      ? solutionRows[selectedCell.iRow][selectedCell.iCol]
      : userEntries[selectedCellKey!]?.value
    : undefined;

  return (
    <article className={styles.sudoku}>
      <div className={styles.boardStack}>
        {renderStatusRow()}
        {completedNumberNotification !== null && (
          <div className={styles.completedNumberToast} role="status">
            {completedNumberNotification} completed
          </div>
        )}
        <div className={styles.board} aria-label="Sudoku board">
          {solutionRows.map((row, iRow) => (
            <div className={styles.row} key={iRow}>
              {row.map((_, iCol) => {
                const cellKey = getCellKey(iRow, iCol);
                const isGiven = givenCells.has(cellKey);
                const userEntry = userEntries[cellKey];
                const isSelected =
                  selectedCell?.iRow === iRow && selectedCell?.iCol === iCol;
                const displayValue = isGiven
                  ? solutionRows[iRow][iCol]
                  : userEntry?.value;
                const matchesSelectedValue =
                  selectedDisplayValue !== undefined &&
                  displayValue === selectedDisplayValue;
                const isHighlighted =
                  selectedCell?.iRow === iRow ||
                  selectedCell?.iCol === iCol ||
                  matchesSelectedValue;

                return (
                  <button
                    aria-label={`Sudoku cell row ${iRow + 1} column ${
                      iCol + 1
                    }`}
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
      </div>
      {renderKeypad()}

      {isGameOver && (
        <GameEndOverlay
          result={hasWon ? "win" : "lose"}
          title={
            hasWon && unlockedDifficultyLabel
              ? `${unlockedDifficultyLabel} unlocked \uD83D\uDD13`
              : hasWon
              ? "Solved!"
              : "Game over"
          }
          message={
            hasWon && unlockedDifficultyLabel
              ? "Your next game will start there."
              : hasWon
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
