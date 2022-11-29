import { GameTypesKeys } from "./mineTypes";

export type GameState = {
  isLost: boolean;
  uncoveredCells: number;
  gridSize: GameTypesKeys;
};

export enum GameActionType {
  TOGGLE_LOST = "TOGGLE_LOST",
  UNCOVER_CELL = "UNCOVER_CELL",
  CHOOSE_SIZE = "CHOOSE_SIZE",
}

type ToggleLostAction = {
  type: GameActionType.TOGGLE_LOST;
  //no payload necessary as is bool
};

type UncoverCellAction = {
  type: GameActionType.UNCOVER_CELL;
  payload: number
};

//discrimination unions..
type ChooseGridSizeAction = {
  type: GameActionType.CHOOSE_SIZE;
  payload: GameTypesKeys,
};

export type GameActions =
  | ToggleLostAction
  | UncoverCellAction
  | ChooseGridSizeAction;
