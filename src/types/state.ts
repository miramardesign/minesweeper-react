import { CellData, GameStateDisplay, GameTypesKeys } from "./mineTypes";

export type GameState = {
  isLost: boolean;
  isGameOver: boolean;
  isGameStarted: boolean;
  uncoveredCells: number;
  flagsPlaced: number;
  gridSize: GameTypesKeys;
  gameStateDisplay: GameStateDisplay;
  mineData: CellData[][];
};

export enum GameActionType {
  TOGGLE_LOST = "TOGGLE_LOST",
  SET_START = "TOGGLE_START",
  SET_END = "TOGGLE_END",
  UPDATE_UNCOVER_CELL = "UPDATE_UNCOVER_CELL",
  CHANGE_GAMESTATE_DISPLAY = "CHANGE_GAMESTATE_DISPLAY",
  INCREMENT_UNCOVER_CELL = "INCREMENT_UNCOVER_CELL",
  SET_UNCOVER_CELL = "SET_UNCOVER_CELL",
  INCREMENT_FLAGS_PLACED = "INCREMENT_FLAGS_PLACED",
  DECREMENT_FLAGS_PLACED = "DECREMENT_FLAGS_PLACED",
  CHOOSE_SIZE = "CHOOSE_SIZE",
  RESET_GAME = "RESET_GAME",
  SET_MINE_DATA = "SET_MINE_DATA",
}

type ToggleLostAction = {
  type: GameActionType.TOGGLE_LOST;
};

type StartGameAction = {
  type: GameActionType.SET_START;
  payload: boolean;
};

type EndGameAction = {
  type: GameActionType.SET_END;
  payload: boolean;
};

type UpdateUncoverCellAction = {
  type: GameActionType.UPDATE_UNCOVER_CELL;
  payload: number;
};

type ChangeGameStateDisplay = {
  type: GameActionType.CHANGE_GAMESTATE_DISPLAY;
  payload: GameStateDisplay;
};

type IncrementUncoverCellAction = {
  type: GameActionType.INCREMENT_UNCOVER_CELL;
};

type SetUncoverCellAction = {
  type: GameActionType.SET_UNCOVER_CELL;
  payload: number;
};

type IncrementFlagsPlacedAction = {
  type: GameActionType.INCREMENT_FLAGS_PLACED;
};

type DecrementFlagsPlacedAction = {
  type: GameActionType.DECREMENT_FLAGS_PLACED;
};

type ChooseGridSizeAction = {
  type: GameActionType.CHOOSE_SIZE;
  payload: GameTypesKeys;
};

type ResetGameAction = {
  type: GameActionType.RESET_GAME;
  payload: GameState;
};

type GetMineDataAction = {
  type: GameActionType.SET_MINE_DATA;
  payload: CellData[][];
};

export type GameActions =
  | ToggleLostAction
  | StartGameAction
  | EndGameAction
  | UpdateUncoverCellAction
  | ChangeGameStateDisplay
  | IncrementUncoverCellAction
  | SetUncoverCellAction
  | IncrementFlagsPlacedAction
  | DecrementFlagsPlacedAction
  | ChooseGridSizeAction
  | ResetGameAction
  | GetMineDataAction;
