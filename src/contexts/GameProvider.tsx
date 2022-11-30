import React, { createContext, PropsWithChildren, useReducer } from "react";
import { GameActions, GameActionType, GameState } from "../types/state";

export const initialState: GameState = {
  isLost: false,
  uncoveredCells: 0,
  gridSize: "beginner",
};


export const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameActions>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const GameProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState, initReducer);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// https://reactjs.org/docs/hooks-reference.html#lazy-initialization
/**
 * reset the game state...
 * @param initialState 
 * @returns 
 */
const initReducer = (initialState: GameState) => {
  return {
    isLost: initialState.isLost,
    uncoveredCells: initialState.uncoveredCells,
    gridSize: initialState.gridSize,

  };
}

const reducer = (state: GameState, action: GameActions): GameState => {
  switch (action.type) {
    case GameActionType.TOGGLE_LOST:
      return {
        ...state,
        isLost: !state.isLost,
      };
    case GameActionType.UPDATE_UNCOVER_CELL:
      return {
        ...state,
        uncoveredCells: action.payload,
      };
    case GameActionType.INCREMENT_UNCOVER_CELL:
      return {
        ...state,
        uncoveredCells: state.uncoveredCells + 1,
      };
    case GameActionType.CHOOSE_SIZE:
      return {
        ...state,
        gridSize: action.payload,
      };
    case GameActionType.RESET_GAME:
      return initReducer(action.payload);
    default:
      console.error("Action not implemented", action);
      throw new Error();
  }
};
