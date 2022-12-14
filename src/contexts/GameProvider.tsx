import React, {
  cloneElement,
  createContext,
  PropsWithChildren,
  useReducer,
} from "react";
import { GameStateDisplay, GameTypes } from "../types/mineTypes";
import { GameActions, GameActionType, GameState } from "../types/state";
import {
  getGameSize,
  getGridDataStructureFromGameConfig,
} from "../utils/mineSetup";

export const gridSizeSeparate: keyof GameTypes = "test";

export const emptyMineDataStructure = getGridDataStructureFromGameConfig(
  getGameSize(gridSizeSeparate)
);

export const initialState: GameState = {
  isLost: false,
  isGameOver: false,
  isGameStarted: false,
  uncoveredCells: 0,
  flagsPlaced: 0,
  gameStateDisplay: GameStateDisplay.UNSTARTED,
  gridSize: gridSizeSeparate,
  mineData: emptyMineDataStructure,
};

export const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameActions>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const GameProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(gameReducer, initialState, initGameReducer);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// https://reactjs.org/docs/hooks-reference.html#lazy-initialization
/**
 * reset the game state...
 * @param initialGameState
 * @returns
 */
const initGameReducer = (initialGameState: GameState) => {
  return initialGameState;
};

const gameReducer = (state: GameState, action: GameActions): GameState => {
  switch (action.type) {
    case GameActionType.TOGGLE_LOST:
      return {
        ...state,
        isLost: !state.isLost,
        gameStateDisplay: GameStateDisplay.LOSE,
      };
    case GameActionType.SET_START:
      return {
        ...state,
        isGameStarted: action.payload,
      };
    case GameActionType.SET_END:
      return {
        ...state,
        isGameOver: action.payload,
      };
    case GameActionType.UPDATE_UNCOVER_CELL:
      return {
        ...state,
        uncoveredCells: action.payload,
      };
    case GameActionType.CHANGE_GAMESTATE_DISPLAY:
      return {
        ...state,
        gameStateDisplay: action.payload,
      };
    case GameActionType.INCREMENT_UNCOVER_CELL:
      return {
        ...state,
        uncoveredCells: state.uncoveredCells + 1,
      };
    case GameActionType.INCREMENT_FLAGS_PLACED:
      return {
        ...state,
        flagsPlaced: state.flagsPlaced + 1,
      };
    case GameActionType.DECREMENT_FLAGS_PLACED:
      return {
        ...state,
        flagsPlaced: state.flagsPlaced - 1,
      };
    case GameActionType.CHOOSE_SIZE:
      return {
        ...state,
        gridSize: action.payload,
      };
    case GameActionType.SET_MINE_DATA:
      return {
        ...state,
        mineData: action.payload,
      };
    case GameActionType.RESET_GAME:
      return initGameReducer(action.payload);
    default:
      console.error("Action not implemented", action);
      throw new Error();
  }
};
