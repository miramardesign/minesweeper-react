import { GameTypesKeys } from "./mineTypes";

export type GameState = {
  isLost: boolean;
  uncoveredCells: number;
  gridSize: GameTypesKeys;
};

export enum GameActionType {
  TOGGLE_LOST = "TOGGLE_LOST",
  UPDATE_UNCOVER_CELL = "UPDATE_UNCOVER_CELL",
  INCREMENT_UNCOVER_CELL = "INCREMENT_UNCOVER_CELL",
  CHOOSE_SIZE = "CHOOSE_SIZE",
  RESET_GAME = "RESET_GAME",
}

type ToggleLostAction = {
  type: GameActionType.TOGGLE_LOST;
  //no payload necessary as is bool
};

type UncoverCellAction = {
  type: GameActionType.UPDATE_UNCOVER_CELL;
  payload: number;
};

type IncrementUncoverCellAction = {
  type: GameActionType.INCREMENT_UNCOVER_CELL;
};

//discrimination unions..
type ChooseGridSizeAction = {
  type: GameActionType.CHOOSE_SIZE;
  payload: GameTypesKeys;
};

type ResetGameAction = {
  type: GameActionType.RESET_GAME;
  payload: GameState;
};

export type GameActions =
  | ToggleLostAction
  | UncoverCellAction
  | IncrementUncoverCellAction
  | ChooseGridSizeAction
  | ResetGameAction;
