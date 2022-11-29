import { CellData, GameConfig, GameTypesKeys, PerimeterDirections } from "../types/mineTypes";
import { GameSizes } from "./mineSetupData";

const getRandInt = (min: number, max: number) => {
  return Math.floor(Math.random() * max);
};

const existsCell = (mineData: CellData[][], iRow: number, iCol: number) => {
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

    if (existsCell(mineData, rowRand, colRand)) {
      let cell = mineData[rowRand][colRand];

      //TODO exclude the first clicked cell, from bombs placed.
      const isInitialCell = rowRand === rowInitialCell || colRand === colInitialCell;

      //choose other celll.
      if (cell.hasMine || isInitialCell  ) {
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
const placeNumAdjMineData = (mineData: CellData[][]) => {
  mineData.map((row, iRow) => {
    //  console.log('row' + index, row);
    row.map((cell, iCol) => {
      cell.numAdjMines = 0;
      loopAdjCells(
        mineData,
        iRow,
        iCol,
        (mineData: CellData[][], iRow: number, iCol: number) => {
          // console.log('cb', mineData, iRow, iCol);

          if (existsAndIsMine(mineData, iRow, iCol)) {
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
    let flagsPlaced = 0;

    if (cell.uncovered) {
      return;
    }

    switch (cell.markedAs) {
      case "": {
        cell.markedAs = "flag";

       // setFlagsPlaced(flagsPlaced + 1);
       flagsPlaced = 1;
        //its really a flag, the mines are only shown on lose.

        break;
      }
      case "flag": {
       // setFlagsPlaced(flagsPlaced - 1);
       flagsPlaced = -1;
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
      flagsPlaced: flagsPlaced,
      mineData: mineData,
    }

  };


/**
 * pass in a row and col and return if hasMine,
 * returning false if doesnt exist (so the edges dont fail)
 * @param mineData
 * @param iRow
 * @param iCol
 * @returns
 */
const existsAndIsMine = (
  mineData: CellData[][],
  iRow: number,
  iCol: number
) => {
  //depp bc looper already calls.
  if (!existsCell(mineData, iRow, iCol)) {
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





/**
 * run a cb on every adj cell of a given cell by iCol and iRow
 * @param mineData
 * @param iRow
 * @param iCol
 * @param cb
 */
const loopAdjCells = (
  mineData: CellData[][],
  iRow: number,
  iCol: number,
  cb: any
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

  Object.entries(perimeter).forEach(([key, cell], index) => {

    if (existsCell(mineData, cell.iRow, cell.iCol)) {
      cb(mineData, cell.iRow, cell.iCol);
    }
  });
};

/**
 * generates an array with empty mine data to the proscribed number of rows and cells
 * @param numRows
 * @param numCols
 * @param numMines
 * @returns
 */
const getMineData = (numRows: number, numCols: number, numMines: number) => {
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

  // mineData = placeMines(mineData, numRows, numCols, numMines);
  // mineData = setNumAdjMineData(mineData);

  return mineData;
};

const isLoseCondition = (
  iRow: number,
  iCol: number,
  mineData: CellData[][]
) => {
  return isMine(iRow, iCol, mineData);
};

/**
 * one dimensional array of cell data, instead of being split into rows/cols its just an array.
 * @param mineData
 * @returns
 */
const getMineDataOneDim = (mineData: CellData[][]): CellData[] => {
  let mineDataOneDim: CellData[] = [];
  mineData.map((row, iRow) => {
    row.map((cell, iCol) => {
      mineDataOneDim.push(cell);
    });
  });

  return mineDataOneDim;
};

const getUncoveredCells = (mineData: CellData[][]): CellData[][] => {
  mineData.map((row, iRow) => {
    row.map((cell, iCol) => {
      mineData[iRow][iCol].uncovered = true;
    });
  });
  return mineData;
};

const getGameSize = (gridSize: GameTypesKeys) : GameConfig=> {
  return GameSizes[gridSize];
}


export {
  getMineData,
  getMineDataOneDim,
  isMine,
  isLoseCondition,
  getUncoveredCells,
  placeMines,
  placeNumAdjMineData,
  placeCellMark,
  existsCell,
  getGameSize,
  loopAdjCells,
};
