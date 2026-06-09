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
import SudokuKeypad, { NumberPadOption } from "./SudokuKeypad";
import styles from "./SudokuBoard.module.scss";

type UserCell = {
  value: number;
  isCorrect: boolean;
};
type UserEntries = Record<string, UserCell>;
export type SavedSudokuGame = {
  difficulty: SudokuDifficulty;
  elapsedSeconds: number;
  givenCellKeys: string[];
  mistakes: number;
  solutionRows: SudokuGrid;
  updatedAt: string;
  userEntries: UserEntries;
};
type PortraitKeypadPlacement = number;
type LandscapeKeypadPlacement = "left" | "middle" | "right";
type KeypadPlacement = {
  portrait: PortraitKeypadPlacement;
  landscape: LandscapeKeypadPlacement;
};

const getCellKey = (iRow: number, iCol: number) => `${iRow}-${iCol}`;
const getDisplayText = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
const sudokuDifficultyIconClass: Record<SudokuDifficulty, string> = {
  easy: "bi-reception-1",
  medium: "bi-reception-2",
  hard: "bi-reception-3",
  expert: "bi-reception-4",
};
const isSameSudokuBox = (
  firstCell: { iRow: number; iCol: number },
  secondCell: { iRow: number; iCol: number }
) =>
  Math.floor(firstCell.iRow / 3) === Math.floor(secondCell.iRow / 3) &&
  Math.floor(firstCell.iCol / 3) === Math.floor(secondCell.iCol / 3);
const keypadPlacementStorageKey = "sudoku-keypad-placement-v2";
const portraitAboveSnapZoneCount = 6;
const defaultKeypadPlacement: KeypadPlacement = {
  portrait: portraitAboveSnapZoneCount,
  landscape: "right",
};

const getSavedPortraitPlacement = (
  portraitPlacement: Partial<KeypadPlacement>["portrait"] | "top" | "middle" | "bottom"
): PortraitKeypadPlacement => {
  if (
    typeof portraitPlacement === "number" &&
    Number.isInteger(portraitPlacement)
  ) {
    return portraitPlacement < portraitAboveSnapZoneCount
      ? portraitAboveSnapZoneCount - 1
      : portraitAboveSnapZoneCount;
  }

  if (portraitPlacement === "top") {
    return portraitAboveSnapZoneCount - 1;
  }

  if (portraitPlacement === "middle") {
    return portraitAboveSnapZoneCount;
  }

  return defaultKeypadPlacement.portrait;
};

const getSavedKeypadPlacement = (): KeypadPlacement => {
  const savedPlacement = window.localStorage.getItem(keypadPlacementStorageKey);

  if (!savedPlacement) {
    return defaultKeypadPlacement;
  }

  try {
    const parsedPlacement = JSON.parse(savedPlacement) as Partial<KeypadPlacement> & {
      portrait?: PortraitKeypadPlacement | "top" | "middle" | "bottom";
    };

    return {
      portrait: getSavedPortraitPlacement(parsedPlacement.portrait),
      landscape:
        parsedPlacement.landscape === "left" ||
        parsedPlacement.landscape === "middle" ||
        parsedPlacement.landscape === "right"
          ? parsedPlacement.landscape
          : defaultKeypadPlacement.landscape,
    };
  } catch {
    return defaultKeypadPlacement;
  }
};

type SudokuBoardProps = {
  difficulty: SudokuDifficulty;
  elapsedSeconds: number;
  initialSavedGame?: SavedSudokuGame | null;
  isLandscape?: boolean;
  sharedYouTubeEmbedUrl?: string | null;
  unlockedDifficultyLabel?: string;
  onGameEnd: (result: "win" | "lose") => void;
  onGameRestart: () => void;
  onProgressSave: (savedGame: SavedSudokuGame | null) => void;
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
  elapsedSeconds,
  initialSavedGame = null,
  isLandscape = false,
  sharedYouTubeEmbedUrl = null,
  unlockedDifficultyLabel,
  onGameEnd,
  onGameRestart,
  onProgressSave,
  onUnlockedGameRestart,
}: SudokuBoardProps) => {
  const [solutionRows, setSolutionRows] = useState<SudokuGrid>(
    () => initialSavedGame?.solutionRows ?? getRandomSudokuGrid()
  );
  const [givenCells, setGivenCells] = useState<Set<string>>(
    () =>
      new Set(
        initialSavedGame?.givenCellKeys ??
          Array.from(getGivenCells(SudokuDifficultyGivenCounts[difficulty]))
      )
  );
  const [selectedCell, setSelectedCell] = useState<{
    iRow: number;
    iCol: number;
  } | null>(null);
  const [selectedKeypadNumber, setSelectedKeypadNumber] = useState<
    number | null
  >(null);
  const [userEntries, setUserEntries] = useState<UserEntries>(
    () => initialSavedGame?.userEntries ?? {}
  );
  const [mistakes, setMistakes] = useState(
    () => initialSavedGame?.mistakes ?? 0
  );
  const [completedNumberNotification, setCompletedNumberNotification] =
    useState<number | null>(null);
  const [isKeypadDragging, setIsKeypadDragging] = useState(false);
  const [keypadPlacement, setKeypadPlacement] = useState(
    getSavedKeypadPlacement
  );
  const hasReportedGameEnd = useRef(false);
  const previousCompletedNumbers = useRef<Set<number>>(new Set());
  const lastTappedCell = useRef<{ cellKey: string; time: number } | null>(null);
  const clearedCellClick = useRef<string | null>(null);
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
    if (isGameOver) {
      onProgressSave(null);
      return;
    }

    onProgressSave({
      difficulty,
      elapsedSeconds,
      givenCellKeys: Array.from(givenCells),
      mistakes,
      solutionRows,
      updatedAt: new Date().toISOString(),
      userEntries,
    });
  }, [
    difficulty,
    elapsedSeconds,
    givenCells,
    isGameOver,
    mistakes,
    onProgressSave,
    solutionRows,
    userEntries,
  ]);

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

  useEffect(() => {
    window.localStorage.setItem(
      keypadPlacementStorageKey,
      JSON.stringify(keypadPlacement)
    );
  }, [keypadPlacement]);

  const resetPuzzle = () => {
    setSolutionRows(getRandomSudokuGrid());
    setGivenCells(getGivenCells(SudokuDifficultyGivenCounts[difficulty]));
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
    setSolutionRows(getRandomSudokuGrid());
    setGivenCells(getGivenCells(SudokuDifficultyGivenCounts[difficulty]));
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
      <span
        aria-label={`Difficulty: ${getDisplayText(difficulty)}`}
        className={styles.statusDifficulty}
      >
        <span className={styles.statusDifficultyText}>
          Difficulty: {getDisplayText(difficulty)}
        </span>
        <i
          aria-hidden="true"
          className={`bi ${sudokuDifficultyIconClass[difficulty]} ${styles.statusDifficultyIcon}`}
        />
      </span>
      <span
        aria-label={`${mistakes} of 3 mistakes used`}
        className={styles.mistakesRow}
      >
        {Array.from({ length: 3 }, (_, index) => (
          <i
            aria-hidden="true"
            className={`bi bi-x-lg ${styles.mistakeMark} ${
              index < mistakes ? styles.usedMistakeMark : ""
            }`}
            key={index}
          />
        ))}
      </span>
    </div>
  );

  const clearIncorrectEntry = (iRow: number, iCol: number) => {
    if (isGameOver) {
      return false;
    }

    const cellKey = getCellKey(iRow, iCol);
    const userEntry = userEntries[cellKey];

    if (userEntry?.isCorrect !== false) {
      return false;
    }

    setUserEntries((currentEntries) => {
      const nextEntries = { ...currentEntries };
      delete nextEntries[cellKey];
      return nextEntries;
    });

    setSelectedCell({ iRow, iCol });
    setSelectedKeypadNumber(null);
    return true;
  };

  const handleCellClick = (iRow: number, iCol: number) => {
    const cellKey = getCellKey(iRow, iCol);

    if (clearedCellClick.current === cellKey) {
      clearedCellClick.current = null;
      return;
    }

    if (isGameOver) {
      return;
    }

    setSelectedCell({ iRow, iCol });

    const displayValue = givenCells.has(cellKey)
      ? solutionRows[iRow][iCol]
      : userEntries[cellKey]?.value;

    if (displayValue !== undefined) {
      setSelectedKeypadNumber(displayValue);
    }
  };

  const handleCellPointerUp = (iRow: number, iCol: number) => {
    const cellKey = getCellKey(iRow, iCol);
    const currentTime = Date.now();
    const previousTap = lastTappedCell.current;
    const isDoubleTap =
      previousTap?.cellKey === cellKey && currentTime - previousTap.time < 350;

    lastTappedCell.current = { cellKey, time: currentTime };

    if (!isDoubleTap) {
      return;
    }

    lastTappedCell.current = null;

    if (clearIncorrectEntry(iRow, iCol)) {
      clearedCellClick.current = cellKey;
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

    setSelectedKeypadNumber(numberPadOption);

    const isCorrect =
      solutionRows[selectedCell.iRow][selectedCell.iCol] === numberPadOption;

    setUserEntries((currentEntries) => {
      const nextEntries = {
        ...currentEntries,
        [cellKey]: {
          value: numberPadOption,
          isCorrect,
        },
      };

      if (isCorrect) {
        Object.entries(currentEntries).forEach(([entryCellKey, entry]) => {
          if (entry.value !== numberPadOption || entry.isCorrect) {
            return;
          }

          const [entryRow, entryCol] = entryCellKey.split("-").map(Number);

          if (
            entryCellKey !== cellKey &&
            isSameSudokuBox(selectedCell, { iRow: entryRow, iCol: entryCol })
          ) {
            delete nextEntries[entryCellKey];
          }
        });
      }

      return nextEntries;
    });

    if (!isCorrect) {
      playWrongAnswerSound();
      setMistakes((currentMistakes) => currentMistakes + 1);
    }
  };

  const handleCellDoubleClick = (iRow: number, iCol: number) => {
    clearIncorrectEntry(iRow, iCol);
  };

  const selectedCellKey = selectedCell
    ? getCellKey(selectedCell.iRow, selectedCell.iCol)
    : null;
  const selectedDisplayValue = selectedCell
    ? givenCells.has(selectedCellKey!)
      ? solutionRows[selectedCell.iRow][selectedCell.iCol]
      : userEntries[selectedCellKey!]?.value
    : undefined;
  const isPortraitKeypadAbove =
    keypadPlacement.portrait < portraitAboveSnapZoneCount;
  const keypadPlacementClass = isLandscape
    ? keypadPlacement.landscape === "left"
      ? styles.sudokuLandscapeKeypadLeft
      : keypadPlacement.landscape === "middle"
      ? styles.sudokuLandscapeKeypadMiddle
      : styles.sudokuLandscapeKeypadRight
    : keypadPlacement.portrait < portraitAboveSnapZoneCount
    ? styles.sudokuPortraitKeypadAbove
    : styles.sudokuPortraitKeypadBelow;
  const boardSwapHintClass = isLandscape
    ? keypadPlacement.landscape === "left"
      ? styles.boardSwapHintLeft
      : styles.boardSwapHintRight
    : isPortraitKeypadAbove
    ? styles.boardSwapHintTop
    : styles.boardSwapHintBottom;
  const boardSwapHintIconClass = isLandscape
    ? keypadPlacement.landscape === "left"
      ? "bi-arrow-right"
      : "bi-arrow-left"
    : isPortraitKeypadAbove
    ? "bi-arrow-down"
    : "bi-arrow-up";

  const handleKeypadPlacementChange = (
    nextPlacement: PortraitKeypadPlacement | LandscapeKeypadPlacement,
    placementIsLandscape: boolean
  ) => {
    setKeypadPlacement((currentPlacement) =>
      placementIsLandscape
        ? {
            ...currentPlacement,
            landscape: nextPlacement as LandscapeKeypadPlacement,
          }
        : {
            ...currentPlacement,
            portrait: nextPlacement as PortraitKeypadPlacement,
          }
    );
  };

  return (
    <article
      className={`${styles.sudoku} ${
        isLandscape ? styles.sudokuLandscape : ""
      } ${keypadPlacementClass}`}
    >
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
                const isCompletedDisplayValue =
                  displayValue !== undefined &&
                  completedNumbers.has(displayValue);
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
                      isSelected && isCompletedDisplayValue
                        ? styles.selectedCompletedCell
                        : ""
                    } ${
                      isGiven ? styles.givenCell : ""
                    } ${
                      userEntry?.isCorrect === true ? styles.correctCell : ""
                    } ${
                      userEntry?.isCorrect === false ? styles.incorrectCell : ""
                    }`}
                    key={iCol}
                    onClick={() => handleCellClick(iRow, iCol)}
                    onDoubleClick={() => handleCellDoubleClick(iRow, iCol)}
                    onPointerUp={() => handleCellPointerUp(iRow, iCol)}
                    type="button"
                  >
                    {displayValue}
                  </button>
                );
              })}
            </div>
          ))}
          {isKeypadDragging && (
            <div
              aria-hidden="true"
              className={`${styles.boardSwapHint} ${boardSwapHintClass}`}
            >
              <i className={`bi ${boardSwapHintIconClass}`} />
            </div>
          )}
        </div>
      </div>
      <SudokuKeypad
        completedNumbers={completedNumbers}
        isLandscape={isLandscape}
        landscapePlacement={keypadPlacement.landscape}
        portraitIsAbove={isPortraitKeypadAbove}
        sharedYouTubeEmbedUrl={sharedYouTubeEmbedUrl}
        selectedKeypadNumber={selectedKeypadNumber}
        onDragChange={setIsKeypadDragging}
        onPlacementChange={handleKeypadPlacementChange}
        onNumberPadClick={handleNumberPadClick}
      />

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
