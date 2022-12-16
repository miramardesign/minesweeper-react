export interface CellData {
  hasMine: boolean;
  markedAs: string;
  uncovered: boolean;
  numAdjMines: number;
  origIndex?: number; //to help me track shuffling 
}

export interface RowData {
  cells: CellData[];
}
export interface MineData {
  rows: RowData[];
}

interface CellDirectionData {
  iRow: number;
  iCol: number;
}

/**
 * the addresses of neighbors of a given cell.
 * optional since they could be out of bounds or a mine.
 */
export interface PerimeterDirections {
  northWest?: CellDirectionData;
  north?: CellDirectionData;
  northEast?: CellDirectionData;
  west?: CellDirectionData;
  east?: CellDirectionData;
  southWest?: CellDirectionData;
  south?: CellDirectionData;
  southEast?: CellDirectionData;
}

/**
 * offset data stored here. required all.
 */
export type PerimeterDirectionsOffsets = {
  [Property in keyof PerimeterDirections]-?: PerimeterDirections[Property];
};

export type PerimeterDirectionsKeys = keyof PerimeterDirections;
export interface GameTypes {
  test: GameConfig;
  beginner: GameConfig;
  intermediate: GameConfig;
  expert: GameConfig;
}

export interface GameConfig {
  mines: number;
  rows: number;
  cols: number;
}

export type GameTypesKeys = keyof GameTypes;

export enum GameStateDisplay {
  UNSTARTED = ":)",
  DANGER = ":()",
  LOSE = ":(",
  PLAY = ": )",
}

