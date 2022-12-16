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
import { GameSizes, PERIMETER_CELLS_OFFSETS } from "./mineSetupData";

const getRandPosInt = (max: number) => {
  return Math.floor(Math.random() * max);
};

/**
 * depping since im checking cell boounds now.
 * @param iRow
 * @param iCol
 * @param mineData
 * @returns
 */
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
  let minesAlreadyPlaced = 0;

  while (minesAlreadyPlaced < numMines) {
    let rowRand = getRandPosInt(numRows);
    let colRand = getRandPosInt(numCols);

    if (existsCell(rowRand, colRand, mineData)) {
      let cell = mineData[rowRand][colRand];

      //excludes the first clicked cell, from bombs placed.
      const isInitialCell =
        rowRand === rowInitialCell && colRand === colInitialCell;

      //choose other celll.
      if (cell.hasMine || isInitialCell) {
        const randDirPos: boolean = (getRandPosInt(1) ? 0 : 1) === 1;
        console.log(randDirPos, "randdirPositvie");
        const newColRand = getRandPosInt(numCols);

        console.log(
          "mine collision, just jump another random num of spaces and loop until you find an empty space?"
        );
      } else {
        cell.hasMine = true;

        minesAlreadyPlaced++;
      }
    }
  }

  return mineData;
};

/**
 * instead of randomly placing mines, place the mines in order, and shuffle.
 * fischer-yates. https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
 * @param array array to shuffle
 * @returns
 */
const shuffleArray = (array: string[] | any[]): any[] => {
  for (let curI = array.length - 1; curI > 0; curI--) {
    const destI = Math.floor(Math.random() * (curI + 1));
    const tempNode = array[curI];
    array[curI] = array[destI];
    array[destI] = tempNode;
  }
  return array;
};

/**
 * translates address of click
 * @param numCols
 * @param rowInitialCell
 * @param colInitialCell
 * @returns
 */
const getInitialCellIndexOneDim = (
  numCols: number,
  rowInitialCell: number,
  colInitialCell: number
): number => {
  let initialCellOneDim = rowInitialCell * numCols + colInitialCell;

  return initialCellOneDim;
};

//i thinhk this only moves mines one or two over, so if they
//neighbor swapping.
//are previously bunched up, then they will still be pretty grouped.
const shuffleSort = (a: any, b: any) => Math.random() - 0.5;

/**
 * place mines in single dimensional array using a random chance
 * and then call shuffle.
 * the num of mines is the prescribed number
 * @param mineData
 * @param numRows
 * @param numCols
 * @param numMines
 * @returns
 */
const placeMinesShuffled = (
  numRows: number,
  numCols: number,
  numMines: number,
  rowInitialCell: number,
  colInitialCell: number,
  msg: string = ""
) => {
  console.log("placeMinesShuffled called by ", msg);
  let minesAlreadyPlaced = 0;
  const numCells = numRows * numCols;
  let mineChance = 1.25 - numMines / numCells;
  let mineDataLocalOneDim: CellData[] = new Array(numRows * numCols)
    .fill([])
    .map((element, index) => {
      const hasMineElement =
        minesAlreadyPlaced < numMines && Math.random() > 0.5;

      element.origIndex = index;
      if (hasMineElement) {
        minesAlreadyPlaced++;
      }

      return {
        hasMine: hasMineElement,
        markedAs: "",
        uncovered: false,
        numAdjMines: -1,
        origIndex: index,
      };
    });

  if (minesAlreadyPlaced < numMines) {
    console.error("not enough mines placed, place more", minesAlreadyPlaced);
  }

  // mineDataLocalOneDim.sort(shuffleSort);
  mineDataLocalOneDim = shuffleArray(mineDataLocalOneDim);

  //if initial cell is a bomb after shuffle move the bomb to the next available space, or randomly choose direction first
  const initialCellOneDim = getInitialCellIndexOneDim(
    numCols,
    rowInitialCell,
    colInitialCell
  );

  if (mineDataLocalOneDim[initialCellOneDim].hasMine) {
    console.error("user clicked on mine initally; move it!");
  }

  let mineData = singleArrayToMultiArray(mineDataLocalOneDim, numCols);

  console.log("mineDataLocalOneDim after shuffle", mineDataLocalOneDim);
  console.log("mineDataFilled after shuffle", mineData);
  return mineData;
};

/**
 * go from 1 dim to 2 dimensions, with a prescribe number of cols in a row
 * @param bigArray
 * @param numCols
 * @returns
 */
const singleArrayToMultiArray = (bigArray: any[], numCols: number): any[][] => {
  let arrayOfArrays = [];
  for (let i = 0; i < bigArray.length; i += numCols) {
    arrayOfArrays.push(bigArray.slice(i, i + numCols));
  }

  return arrayOfArrays;
};

/**
 * put the adjacent mine date in the mine data.
 * @param mineData
 */
const placeNumAdjMineData = async (
  mineData: CellData[][]
  // dispatch: React.Dispatch<GameActions>
) => {
  // console.log(
  //   "placeNumAdjMineData mineData lenght:",
  //   mineData.length,
  //   "first row lenght",
  //   mineData[0].length
  // );
  await mineData.map((row, iRow) => {
    //console.log("rowwwwwwwwwwwwwwwwww", row);

    row.map(async (cell, iCol) => {
      // console.log('colllllllllllllll', cell);
      cell.numAdjMines = 0;
      await loopAdjCells(
        iRow,
        iCol,
        mineData,
        //dispatch,
        (
          iRow: number,
          iCol: number,
          mineData: CellData[][]
          // dispatch
        ) => {
          if (existsAndIsMine(iRow, iCol, mineData)) {
            console.log(
              "numAdjMinesnumAdjMinesnumAdjMinesnumAdjMinesnumAdjMinesnumAdjMines",
              cell.numAdjMines
            );

            cell.numAdjMines++;
          } else {
            console.log("not mine", iRow, iCol);
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
    console.log("ret false bc not exisitn cell");
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
 * @param cb callback that calls a fn on every cell of perimeter.
 */
const loopAdjCells = (
  iRow: number,
  iCol: number,
  mineData: CellData[][],
  //dispatch: React.Dispatch<GameActions>,
  cb: (
    iRow: number,
    iCol: number,
    mineData: CellData[][]
    //dispatch: React.Dispatch<GameActions>
  ) => void
) => {
  //TODO: pass in from gamestate.
  const numRows = mineData.length;
  const numCols = mineData[0].length;

  const perimeterCells: PerimeterDirections = getPerimeterCells(
    iRow,
    iCol,
    numRows,
    numCols
  );

  //depped because i had too much data, e.g. prefiiltered out of bounds cells.
  // for (let direction in perimeterCells) {
  //   let cell = perimeterCells[direction as PerimeterDirectionsKeys];
  //   if (existsCell(cell.iRow, cell.iCol, mineData)) {
  //     cb(cell.iRow, cell.iCol, mineData, dispatch);
  //   }
  // }

  Object.entries(perimeterCells).forEach(([key, cell], index) => {
    cb(cell.iRow, cell.iCol, mineData);
  });
};

const bothInBounds = (
  iRow: number,
  iCol: number,
  numRows: number,
  numCols: number
): boolean => {
  const rowInBounds = iRow > -1 && iRow < numRows;
  const colInBounds = iCol > -1 && iCol < numCols;

  return rowInBounds && colInBounds;
};

/**
 * object containing data of coords on every adjacent
 *  cell of a given cell by iCol and iRow
 * @param iRow
 * @param iCol
 */
const getPerimeterCells = (
  iRow: number,
  iCol: number,
  numRows: number,
  numCols: number
) => {
  //exclude out of bounds cells, so i dont have to loop thru them
  //and call exists.

  const perimeterCellsDynamic: PerimeterDirections = {};

  //loop thru the offsets global CONST for each cardinal direction,
  //if they are in bounds of the grid, add them to the cells dynamic,
  //such that cells dynamic only has valid cells. (theoretically)
  for (let direction in PERIMETER_CELLS_OFFSETS) {
    let cellOffset =
      PERIMETER_CELLS_OFFSETS[direction as PerimeterDirectionsKeys];

    let offSetIrow = cellOffset.iRow + iRow;
    let offSetIcol = cellOffset.iCol + iCol;
    if (bothInBounds(offSetIrow, offSetIcol, numRows, numCols)) {
      perimeterCellsDynamic[direction as PerimeterDirectionsKeys] = {
        iRow: offSetIrow,
        iCol: offSetIcol,
      };
    }
  }

  // console.log(
  //   "perimeter cells of ",
  //   [iRow, iCol],
  //   perimeterCellsDynamic,
  //   "---"
  // );

  return perimeterCellsDynamic;
};

/**
 * same as above but joined params.
 * @param gameConfig
 * @returns
 */
const getGridDataStructureFromGameConfig = (gameConfig: GameConfig) => {
  const { rows, cols } = gameConfig;
  //return getGridDataStructure(rows, cols, mines);

  let mineData = new Array(rows).fill([]).map(() => {
    return new Array(cols).fill({}).map((element: CellData) => {
      return {
        hasMine: false,
        markedAs: "",
        uncovered: false,
        numAdjMines: -2,
      };
    });
  });

  return mineData;
};

/**
 * places mines and adjacent mine data and pushes into storage,
 * for a given game size
 * @param iRow row they clicked, i need this to avoid clicking the mine on 1st click
 * @param iCol col ...
 * @param state
 * @param dispatch
 */
const getMineData = async (iRow: number, iCol: number, state: GameState) => {
  const { rows, cols, mines } = getGameSize(state.gridSize);

  // let mineDataLocalOlde = placeMines(
  //   state.mineData,
  //   rows,
  //   cols,
  //   mines,
  //   iRow,
  //   iCol
  // );

  let mineData = await placeMinesShuffled(rows, cols, mines, iRow, iCol);

  mineData = await placeNumAdjMineData(mineData);

  return mineData;
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
 * @returns CellData[][]
 */
const uncoverAdjacentZeroSqs = (
  iRow: number,
  iCol: number,
  mineData: CellData[][]
  // dispatch: React.Dispatch<GameActions>
) => {
  let newlyUncoveredCells = 0;
  if (mineData[iRow][iCol].numAdjMines === 0) {
    loopAdjCells(
      iRow,
      iCol,
      mineData,
      // dispatch,
      (
        iRow: number,
        iCol: number,
        mineData: CellData[][]
        // dispatch: React.Dispatch<GameActions>
      ) => {
        if (!existsCell(iRow, iCol, mineData)) {
          console.error("cell at ", iRow, iCol, "does not exist");
        }

        let cell = mineData[iRow][iCol];

        //why 4? i forget. todo rename...
        const minSiblingMines = 4;

        if (cell.numAdjMines < minSiblingMines) {
          //dont hit already hit mines...
          if (!cell.uncovered) {
            //IMPORTANT increment state.uncovered cells~~~
            cell.uncovered = true;

            // dispatch({
            //   type: GameActionType.INCREMENT_UNCOVER_CELL,
            // });
            newlyUncoveredCells++;

            //call neighborcells recursion!!---
            newlyUncoveredCells += uncoverAdjacentZeroSqs(iRow, iCol, mineData);
            // uncoverAdjacentZeroSqs(iRow, iCol, mineData, dispatch);
          }
        }
      }
    );
  }
  return newlyUncoveredCells;
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
  dispatch: React.Dispatch<GameActions>,
  initialState: GameState
) => {
  dispatch({
    type: GameActionType.RESET_GAME,
    payload: initialState,
  });

  const gs = getGameSize(initialState.gridSize);

  let mineDataLocal = getGridDataStructureFromGameConfig(gs);
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
  previouslyUncoveredCells: number,
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
  mineData[iRow][iCol].markedAs = "uncovered";

  let newlyUncoveredCells = uncoverAdjacentZeroSqs(iRow, iCol, mineData); //, dispatch);
  let numUncoveredLocal = 1 + newlyUncoveredCells + previouslyUncoveredCells;

  //get from recursion amount uncoverd and add current + previousl.
  dispatch({
    type: GameActionType.UPDATE_UNCOVER_CELL,
    payload: numUncoveredLocal,
  });

  dispatch({ type: GameActionType.SET_MINE_DATA, payload: mineData });

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
  mineData: CellData[][],
  state: GameState,
  dispatch: React.Dispatch<GameActions>
) => {
  //already lost.
  if (state.isLost) {
    return;
  }

  //has bug resetting.
  uncoverCell(
    iRow,
    iCol,
    mineData,
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
   getGridDataStructureFromGameConfig,
  getMineData,
  isMine,
  isLoseCondition,
  // placeMines,
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
