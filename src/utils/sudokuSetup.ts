export type SudokuGrid = number[][];
export type SudokuDifficulty = "easy" | "medium" | "hard" | "expert";

export const SudokuDifficultyGivenCounts: Record<SudokuDifficulty, number> = {
  easy: 40,
  medium: 34,
  hard: 28,
  expert: 22,
};

const boardSize = 9;
const boxSize = 3;

const shuffle = <T,>(items: T[]): T[] => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
};

const getShuffledSudokuIndexes = () => {
  const bands = shuffle([0, 1, 2]);

  return bands.flatMap((band) =>
    shuffle([0, 1, 2]).map((indexInBand) => band * boxSize + indexInBand)
  );
};

const getPatternValue = (row: number, col: number) => {
  return (boxSize * (row % boxSize) + Math.floor(row / boxSize) + col) % boardSize;
};

export const getRandomSudokuGrid = (): SudokuGrid => {
  const rows = getShuffledSudokuIndexes();
  const cols = getShuffledSudokuIndexes();
  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  return rows.map((row) =>
    cols.map((col) => numbers[getPatternValue(row, col)])
  );
};
