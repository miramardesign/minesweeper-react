export interface CellData {
  hasMine: boolean;
  markedAs: string;
  uncovered: boolean;
  numAdjMines: number;
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
export interface PerimeterDirections {
  northWest: CellDirectionData;
  north: CellDirectionData;
  northEast: CellDirectionData;
  west: CellDirectionData;
  east: CellDirectionData;
  southWest: CellDirectionData;
  south: CellDirectionData;
  southEast: CellDirectionData;
}

export type PerimeterDirectionsKeys = keyof PerimeterDirections;
export interface GameTypes {
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
