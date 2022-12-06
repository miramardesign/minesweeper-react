import React from "react";
import {
  CellData,
  GameConfig,
  GameStateDisplay,
  GameTypesKeys,
  PerimeterDirections,
  PerimeterDirectionsKeys,
} from "../types/mineTypes";
import { GameActions, GameActionType, GameState } from "../types/state";
import { GameSizes } from "./mineSetupData";

const getRandInt = (min: number, max: number) => {
  return Math.floor(Math.random() * max);
};

const existsCell = (iRow: number, iCol: number, mineData: CellData[][]) => {
  // console.log('existscelllllllllllllll', iRow);
  //row doesnt exist
  if (mineData[iRow] === undefined) {
    return false;
  }

  //col doesnt exist
  if (mineData[iRow][iCol] === undefined) {
    return false;
  }

  return true;
};

/**
 * place mines, in rand col and row, being careful to dedupe such that
 * the num of mines is the prescribed number
 * @param mineData
 * @param numRows
 * @param numCols
 * @param numMines
 * @returns
 */
const placeMines = (
  mineData: CellData[][],
  numRows: number,
  numCols: number,
  numMines: number,
  rowInitialCell: number,
  colInitialCell: number
) => {
  let minesPlacedLocal = 0;

  while (minesPlacedLocal < numMines) {
    let rowRand = getRandInt(0, numRows);
    let colRand = getRandInt(0, numCols);

    if (existsCell(rowRand, colRand, mineData)) {
      let cell = mineData[rowRand][colRand];

      //TODO exclude the first clicked cell, from bombs placed.
      const isInitialCell =
        rowRand === rowInitialCell || colRand === colInitialCell;

      //choose other celll.
      if (cell.hasMine || isInitialCell) {
        // if (cell.hasMine) {
        console.log("mine collision");
      } else {
        cell.hasMine = true;

        minesPlacedLocal++;
      }
    }
  }

  return mineData;
};

/**
 * put the adjacent mine date in the mine data.
 * @param mineData
 */
const placeNumAdjMineData = (
  mineData: CellData[][],
  dispatch: React.Dispatch<GameActions>
) => {
  mineData.map((row, iRow) => {
    row.map((cell, iCol) => {
      cell.numAdjMines = 0;
      loopAdjCells(
        iRow,
        iCol,
        mineData,
        dispatch,
        (iRow: number, iCol: number, mineData: CellData[][], dispatch) => {
          if (existsAndIsMine(iRow, iCol, mineData)) {
            cell.numAdjMines++;
          }
        }
      );
    });
  });

  return mineData;
};

/**
 * just marks as bomb on 1st right click, as question on 2nd and clears on third,
 * @param iRow
 * @param iCol
 * @param mineData
 * @returns
 */
const placeCellMark = (
  iRow: number,
  iCol: number,
  mineData: CellData[][]
): any => {
  console.log("right click?????????????", iRow, iCol);

  const cell = mineData[iRow][iCol];

  if (cell.uncovered) {
    return;
  }

  switch (cell.markedAs) {
    case "": {
      cell.markedAs = "flag";

      break;
    }
    case "flag": {
      cell.markedAs = "question";
      break;
    }
    case "question": {
      cell.markedAs = "";
      break;
    }
    default: {
      console.log("Empty action received.");
    }
  }

  return {
    mineData: mineData,
  };
};

/**
 * pass in a row and col and return if hasMine,
 * returning false if doesnt exist (so the edges dont fail)
 * @param iRow
 * @param iCol
 * @param mineData
 * @returns
 */
const existsAndIsMine = (
  iRow: number,
  iCol: number,
  mineData: CellData[][]
) => {
  //depp bc looper already calls.
  if (!existsCell(iRow, iCol, mineData)) {
    return false;
  }

  //exists but is false
  if (mineData[iRow][iCol] && !mineData[iRow][iCol].hasMine) {
    return false;
  }

  //exists and is true.
  if (mineData[iRow][iCol] && mineData[iRow][iCol].hasMine) {
    return true;
  }

  return false;
};

const isMine = (iRow: number, iCol: number, mineData: CellData[][]) => {
  return mineData[iRow][iCol].hasMine;
};

//things below access dispatch, change state.

/**
 * run a cb on every adj cell of a given cell by iCol and iRow
 * @param iRow
 * @param iCol
 * @param mineData
 * @param cb
 */
const loopAdjCells = (
  iRow: number,
  iCol: number,
  mineData: CellData[][],
  dispatch: React.Dispatch<GameActions>,
  cb: (
    iRow: number,
    iCol: number,
    mineData: CellData[][],
    dispatch: React.Dispatch<GameActions>
  ) => void
) => {
  let perimeter: PerimeterDirections = {
    northWest: {
      iRow: iRow - 1,
      iCol: iCol - 1,
    },
    north: {
      iRow: iRow - 1,
      iCol: iCol,
    },
    northEast: { iRow: iRow - 1, iCol: iCol + 1 },

    west: { iRow: iRow, iCol: iCol - 1 },
    east: { iRow: iRow, iCol: iCol + 1 },

    southWest: {
      iRow: iRow + 1,
      iCol: iCol - 1,
    },
    south: {
      iRow: iRow + 1,
      iCol: iCol,
    },
    southEast: { iRow: iRow + 1, iCol: iCol + 1 },
  };

  for (let direction in perimeter) {
    let cell = perimeter[direction as PerimeterDirectionsKeys];
    if (existsCell(cell.iRow, cell.iCol, mineData)) {
      // console.log(cell, "cellllllll");
      cb(cell.iRow, cell.iCol, mineData, dispatch);
    }   
  }

  // Object.entries(perimeter).forEach(([key, cell], index) => {
  //   if (existsCell(cell.iRow, cell.iCol, mineData)) {
  //     cb(cell.iRow, cell.iCol, mineData, dispatch);
  //   }
  // });
};

/**
 * generates an array with empty mine data to the proscribed number of rows and cells
 * @param numRows
 * @param numCols
 * @param numMines
 * @returns
 */
const getGridDataStructure = (
  numRows: number,
  numCols: number,
  numMines: number
) => {
  let mineData = new Array(numRows).fill([]).map(() => {
    return new Array(numCols).fill({}).map((element: CellData) => {
      return {
        hasMine: false,
        markedAs: "",
        uncovered: false,
        numAdjMines: 0,
      };
    });
  });

  return mineData;
};

/**
 * places mines and adjacent mine data and pushes into storage,
 * for a given game size
 * @param iRow
 * @param iCol
 * @param state
 * @param dispatch
 */
const getMineData = (
  iRow: number,
  iCol: number,
  state: GameState,
  dispatch: React.Dispatch<GameActions>
) => {
  const { rows, cols, mines } = getGameSize(state.gridSize);
  let mineDataLocal = placeMines(state.mineData, rows, cols, mines, iRow, iCol);
  mineDataLocal = placeNumAdjMineData(mineDataLocal, dispatch);

  dispatch({ type: GameActionType.SET_MINE_DATA, payload: mineDataLocal });
};

/**
 * determine if they hit a mine and thus lost
 * @param iRow
 * @param iCol
 * @param mineData
 * @returns
 */
const isLoseCondition = (
  iRow: number,
  iCol: number,
  mineData: CellData[][]
) => {
  return isMine(iRow, iCol, mineData);
};

/**
 * return the gamedata obj that has numRows, numCols and num mines for a given gridSize
 * from the dropdown.
 * @param gridSize
 * @returns
 */
const getGameSize = (gridSize: GameTypesKeys): GameConfig => {
  return GameSizes[gridSize];
};

/**
 *
 * loops thru neighbors recursively checking and revealing.
 * @param iRow
 * @param iCol
 * @param mineData
 * @param dispatch
 * @returns
 */
const uncoverAdjacentZeroSqs = (
  iRow: number,
  iCol: number,
  mineData: CellData[][],
  dispatch: React.Dispatch<GameActions>
) => {
  if (mineData[iRow][iCol].numAdjMines === 0) {
    loopAdjCells(
      iRow,
      iCol,
      mineData,
      dispatch,
      (
        iRow: number,
        iCol: number,
        mineData: CellData[][],
        dispatch: React.Dispatch<GameActions>
      ) => {
        let cell = mineData[iRow][iCol];

        //why 4? i forget. todo rename...
        const minSiblingMines = 4;

        if (cell.numAdjMines < minSiblingMines) {
          //dont hit already hit mines...
          if (!cell.uncovered) {
            //IMPORTANT increment state.uncovered cells~~~
            cell.uncovered = true;

            dispatch({
              type: GameActionType.INCREMENT_UNCOVER_CELL,
            });

            //call neighborcells recursion!!---
            uncoverAdjacentZeroSqs(iRow, iCol, mineData, dispatch);
          }
        }
      }
    );
  }

  return mineData;
};

/**
 * what happens when we win? we go to disneyland...
 */
const onWinCondition = (
  mineData: CellData[][],
  dispatch: React.Dispatch<GameActions>
) => {
  console.log("onWinCondition");

  uncoverAllCells(mineData, dispatch);

  dispatch({ type: GameActionType.SET_END, payload: true });

  dispatch({
    type: GameActionType.CHANGE_GAMESTATE_DISPLAY,
    payload: GameStateDisplay.PLAY,
  });

  window.setTimeout(() => {
    window.alert("epic Win!!!1111");
  }, 500);
};

const onLoseCondition = (
  iRow: number,
  iCol: number,
  mineData: CellData[][],
  dispatch: React.Dispatch<GameActions>
) => {
  console.log("onLoseCondition");

  dispatch({ type: GameActionType.TOGGLE_LOST });
  dispatch({ type: GameActionType.SET_END, payload: true });

  //if the game is over not because of click but
  //because of timeout im sending -1 and cell wont exist
  if (existsCell(iRow, iCol, mineData)) {
    mineData[iRow][iCol].markedAs = "exploded";
  }
  uncoverAllCells(mineData, dispatch);
  window.setTimeout(() => {
    window.alert("boom!");
  }, 500);
};

/**
 * may have to reset counters here.
 * @param gridSize
 */
const resetGrid = (
  gridSize: GameTypesKeys,
  dispatch: React.Dispatch<GameActions>,
  initialState: GameState,
  caller: string
) => {
  dispatch({
    type: GameActionType.RESET_GAME,
    payload: initialState,
  });
  console.log("reset grid called size", gridSize, "caller:", caller);

  const { rows, cols, mines } = getGameSize(gridSize);

  let mineDataLocal = getGridDataStructure(rows, cols, mines);
  dispatch({ type: GameActionType.SET_MINE_DATA, payload: mineDataLocal });
  dispatch({ type: GameActionType.SET_END, payload: false });
};

/**
 * show whole board for win-lose
 * @param mineData
 */
const uncoverAllCells = (
  mineData: CellData[][],
  dispatch: React.Dispatch<GameActions>
): void => {
  mineData.map((row, iRow) => {
    row.map((cell, iCol) => {
      mineData[iRow][iCol].uncovered = true;
    });
  });
  dispatch({ type: GameActionType.SET_MINE_DATA, payload: mineData });
};

/**
 * uncover the cell and decide what happens next. win, lose or continue...
 * @param iRow
 * @param iCol
 * @param mineData
 * @returns
 */
const uncoverCell = (
  iRow: number,
  iCol: number,
  mineData: CellData[][],
  gridSize: GameTypesKeys,
  uncoveredCells: number,
  dispatch: React.Dispatch<GameActions>
) => {
  if (isLoseCondition(iRow, iCol, mineData)) {
    onLoseCondition(iRow, iCol, mineData, dispatch);
    return;
  }

  //if already uncovered
  if (mineData[iRow][iCol].uncovered) {
    return;
  }

  mineData[iRow][iCol].uncovered = true;
  const numUncoveredLocal = uncoveredCells + 1;
  dispatch({
    type: GameActionType.UPDATE_UNCOVER_CELL,
    payload: numUncoveredLocal,
  });

  mineData[iRow][iCol].markedAs = "uncovered";

  uncoverAdjacentZeroSqs(iRow, iCol, mineData, dispatch);

  dispatch({ type: GameActionType.SET_MINE_DATA, payload: mineData });

  let numMines = GameSizes[gridSize].mines;

  let gameData = GameSizes[gridSize];
  if (isWinCondition(gameData, numUncoveredLocal)) {
    onWinCondition(mineData, dispatch);
  }
};

/**
 *  determines if user has won, counts uncovered cells
 * @param gameData
 * @param uncoveredCellsLen
 * @returns
 */
const isWinCondition = (gameData: GameConfig, uncoveredCellsLen: number) => {
  const allCellsLen = gameData.cols * gameData.rows;
  const allCellsNoMineLen = allCellsLen - gameData.mines;

  return uncoveredCellsLen === allCellsNoMineLen;
};

/**
 * then the turn happens.
 * @param iRow
 * @param iCol
 * @param state
 * @param dispatch
 * @returns
 */
const goTurn = (
  iRow: number,
  iCol: number,
  state: GameState,
  dispatch: React.Dispatch<GameActions>
) => {
  //already lost.
  if (state.isLost) {
    return;
  }

  console.log("clicked row ", iRow, "col", iCol);

  uncoverCell(
    iRow,
    iCol,
    state.mineData,
    state.gridSize,
    state.uncoveredCells,
    dispatch
  );
};

/**
 * just marks as bomb on 1st right click, as question on 2nd and clears on third,
 * @param iRow
 * @param iCol
 * @param mineData
 * @param dispatch
 * @returns
 */
const setCellMark = (
  iRow: number,
  iCol: number,
  mineData: CellData[][],
  dispatch: React.Dispatch<GameActions>
): void => {
  console.log("right click olde?????????????", iRow, iCol);

  const cell = mineData[iRow][iCol];

  if (cell.uncovered) {
    return;
  }

  switch (cell.markedAs) {
    case "": {
      cell.markedAs = "flag";

      dispatch({
        type: GameActionType.INCREMENT_FLAGS_PLACED,
      });
      //its really a flag, the mines are only shown on lose.

      break;
    }
    case "flag": {
      dispatch({
        type: GameActionType.DECREMENT_FLAGS_PLACED,
      });
      cell.markedAs = "question";
      break;
    }
    case "question": {
      cell.markedAs = "";
      break;
    }
    default: {
      console.log("Empty action received.");
    }
  }
};

export {
  getGridDataStructure,
  getMineData,
  isMine,
  isLoseCondition,
  placeMines,
  placeNumAdjMineData,
  placeCellMark,
  existsCell,
  getGameSize,
  loopAdjCells,
  uncoverAdjacentZeroSqs,
  onWinCondition,
  onLoseCondition,
  resetGrid,
  uncoverAllCells,
  uncoverCell,
  goTurn,
  setCellMark,
};
