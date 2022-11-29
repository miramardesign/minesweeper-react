import React, { useEffect, useState } from "react";
import MineCell from "../MineCell/MineCell";
import styles from "./MineGrid.module.scss";
import {
  existsCell,
  getGameSize,
  getMineData,
  getMineDataOneDim,
  isLoseCondition,
  placeCellMark,
  placeMines,
  placeNumAdjMineData,
  uncoverAdjacentZeroSqs,
} from "../../utils/mineSetup";
import {
  CellData,
  GameTypes,
  GameState,
  GameConfig,
  GameTypesKeys,
} from "../../types/mineTypes";
import { GameSizes } from "../../utils/mineSetupData";
import DigitalDisplay from "../DigitalDisplay/DigitalDisplay";
import DigitalDisplayCountup from "../DigitalDisplayCountup/DigitalDisplayCountup";
import GameSizeChooser from "../GameSizeChooser/GameSizeChooser";

const MineGrid = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLose, setIsLose] = useState(false);
  const [gameState, setGameState] = useState(GameState.UNSTARTED);

  const [mineData, setMineData] = useState<CellData[][]>([]);
  const [gridSize, setGridSize] = useState("beginner" as GameTypesKeys);
  const [cellsUncovered, setCellsUncovered] = useState(0);
  const [flagsPlaced, setFlagsPlaced] = useState(0);

  //---use effects
  useEffect(() => {
    const { rows, cols, mines } = getGameSize(gridSize);
    setMineData(getMineData(rows, cols, mines));
  }, []);

  const handleLeftClick = (iRow: number, iCol: number) => {
    console.log("left click yo", mineData, iRow, iCol);
    setGameState(GameState.PLAY);

    if (cellsUncovered === 0) {
      setIsGameStarted(true);

      const { rows, cols, mines } = getGameSize(gridSize);

      let mineDataLocal = placeMines(mineData, rows, cols, mines, iRow, iCol);
      mineDataLocal = placeNumAdjMineData(mineDataLocal);
      setMineData(mineDataLocal);
    }
    goTurn(iRow, iCol);
  };

  const handleLeftOnMouseDown = (iRow: number, iCol: number) => {
    console.log("mousedown");
    setGameState(GameState.DANGER);
  };

  const handleRightClick = (iRow: number, iCol: number) => {
    setCellMarkOld(iRow, iCol, mineData);
  };

  /**when the timer countup says we are out of time.  */
  const handleTimeout = (msg: string) => {
    console.log(msg);
    //alert(msg);
    onLoseCondition(-1, -1, mineData);
  };

  //just marks as bomb on 1st right click, as question on 2nd and clears on third,
  const setCellMarkOld = (
    iRow: number,
    iCol: number,
    mineData: CellData[][]
  ): void => {
    console.log("right click olde?????????????", iRow, iCol);

    const cell = mineData[iRow][iCol];

    if (cell.uncovered) {
      return;
    }

    switch (cell.markedAs) {
      case "": {
        cell.markedAs = "flag";

        setFlagsPlaced(flagsPlaced + 1);
        //its really a flag, the mines are only shown on lose.

        break;
      }
      case "flag": {
        setFlagsPlaced(flagsPlaced - 1);
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

  const setCellMark = (
    iRow: number,
    iCol: number,
    mineData: CellData[][]
  ): void => {
    console.log("right click?????????????", iRow, iCol);
    let ret = placeCellMark(iRow, iCol, mineData);
    setFlagsPlaced(ret.flagsPlaced);
    setMineData(ret.mineData);
  };

  const handleGameSizeChange = (gameSizeName: GameTypesKeys) => {
    console.log("Size Selected!!", gameSizeName);
    setGridSize(gameSizeName);
  };

  /** gridSize dropdown changes, */
  useEffect(() => {
    console.log("gridsized changed.............", gridSize);
    resetGrid(gridSize);
  }, [gridSize]);

  /**
   * may have to reset counters here.
   * @param gridSize
   */
  const resetGrid = (gridSize: String) => {
    setIsLose(false);
    let numRows = GameSizes[gridSize as keyof GameTypes].rows;
    let numCols = GameSizes[gridSize as keyof GameTypes].cols;
    let numMines = GameSizes[gridSize as keyof GameTypes].mines;

    setCellsUncovered(0);
    setFlagsPlaced(0);
    setMineData(getMineData(numRows, numCols, numMines));
    setIsGameStarted(false);
    setIsGameOver(false);
  };

  /**
   * smiley face / frowny face clicked.
   * @param e event of clicked element.
   */
  const handleOnClickResetGrid = (e: React.MouseEvent<HTMLElement>) => {
    resetGrid(gridSize);
  };

  const goTurn = (iRow: number, iCol: number) => {
    //already lost.
    if (isLose) {
      return;
    }

    console.log("clicked row ", iRow, "col", iCol);

    uncoverCell(iRow, iCol, mineData, gridSize);
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
    gridSize: string
  ) => {
    if (isLoseCondition(iRow, iCol, mineData)) {
      onLoseCondition(iRow, iCol, mineData);
      return;
    }

    //if already uncovered
    if (mineData[iRow][iCol].uncovered) {
      return;
    }

    mineData[iRow][iCol].uncovered = true;

    setCellsUncovered(cellsUncovered + 1);

    mineData[iRow][iCol].markedAs = "uncovered";

    uncoverAdjacentZeroSqs(iRow, iCol, mineData);
    setMineData(mineData);

    let numMines = GameSizes[gridSize as keyof GameTypes].mines;

    if (isWinCondition(iRow, iCol, mineData, numMines)) {
      onWinCondition();
    }
  };

  /**
   * show whole board for win-lose
   * @param mineData
   */
  const uncoverAllCells = (mineData: CellData[][]): void => {
    mineData.map((row, iRow) => {
      row.map((cell, iCol) => {
        mineData[iRow][iCol].uncovered = true;
      });
    });
    setMineData(mineData);
  };

  /**
   * determines if user has won, counts uncovered cells
   * @param iRow
   * @param iCol
   * @param mineData
   * @param numMines count of mines placed.
   * @returns
   */
  const isWinCondition = (
    iRow: number,
    iCol: number,
    mineData: CellData[][],
    numMines: number
  ) => {
    0;
    //join rows together... so i can scan once.
    const allCells: CellData[] = getMineDataOneDim(mineData);
    const allCellsNoMineLen = allCells.length - numMines;
    const unconveredLen = allCells.filter((cell) => cell.uncovered).length;
    console.log(
      "isWinCondition --- allCellsNoMineLen",
      allCellsNoMineLen,
      "uncoveredLen",
      unconveredLen
    );

    return unconveredLen === allCellsNoMineLen;
  };

  /**
   * what happens when we win? we go to disneyland...
   */
  const onWinCondition = () => {
    console.log("onWinCondition");

    uncoverAllCells(mineData);
    // setIsGameOver(true);
    setGameState(GameState.WIN);
    window.setTimeout(() => {
      window.alert("epic Win!!!1111");
    }, 500);
  };

  const onLoseCondition = (
    iRow: number,
    iCol: number,
    mineData: CellData[][]
  ) => {
    console.log("onLoseCondition");

    setIsLose(true);
    setGameState(GameState.LOSE);

    // setIsGameStarted(false);
    setIsGameOver(true);

    //if the game is over not because of click but
    //because of timeout im sending -1 and cell wont exist
    if (existsCell(mineData, iRow, iCol)) {
      mineData[iRow][iCol].markedAs = "exploded";
    }
    uncoverAllCells(mineData);
    window.setTimeout(() => {
      window.alert("boom!");
    }, 500);
  };

  return (
    <section>
      <GameSizeChooser onGameSizeChange={handleGameSizeChange} />
      {/* TODO: componentize below */}
      {/* <select
        id="choose-game-size"
        className={styles["wide"]}
        onChange={handleGameSizeChange}
      >
        {Object.keys(GameSizes).map((size) => (
          <option className={styles["cap"]} key={size} value={size}>
            {size}
          </option>
        ))}
      </select> */}

      <article id="wrap-row-digital-display-reset">
        <DigitalDisplay
          id={"mines-remaining"}
          displayNum={
            GameSizes[gridSize as keyof GameTypes].mines - flagsPlaced
          }
        ></DigitalDisplay>
        <br />

        {/* TODO: componentize below */}
        <div id="reset" className={styles["wrap-reset"]}>
          <button className={"square"} onClick={handleOnClickResetGrid}>
            {gameState && <span>{gameState}</span>}
          </button>
        </div>

        <DigitalDisplayCountup
          id={"time-counter"}
          timeoutCount={handleTimeout}
          startCount={isGameStarted}
          gameOver={isGameOver}
        ></DigitalDisplayCountup>
      </article>
      <br />
      <hr className={styles.break} />
      <article>
        {mineData.map((row, iRow) => (
          <div key={iRow}>
            {row.map((col, iCol) => (
              <MineCell
                key={iCol}
                cell={col}
                iRow={iRow}
                iCol={iCol}
                leftClick={handleLeftClick}
                leftOnMouseDown={handleLeftOnMouseDown}
                rightClick={handleRightClick}
              ></MineCell>
            ))}
          </div>
        ))}{" "}
      </article>
    </section>
  );
};

export default MineGrid;

// was in ng
/* component 
<section class="wrap-mine" [ngClass]="'win-' + isLose + ' win-type-' ">
    <div class="row" *ngFor="let row of mineData; let iRow = index">
        <button *ngFor="let cell of row; let iCol = index" class="square" [ngClass]="'mine-' + cell?.hasMine + ' mark-' + cell.markedAs +
    ' uncovered-' + cell.uncovered + ' cell-num-adj-' + cell.numAdjMines  " (click)="goTurn(iRow, iCol )"
            (mouseup)="onMiddleClick($event, iRow, iCol)" (contextmenu)="onRightClick(iRow, iCol)">
        </button>
    </div>
</section>
*/
