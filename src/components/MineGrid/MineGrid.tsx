import React, { useContext, useEffect, useState } from "react";
import MineCell from "../MineCell/MineCell";
import styles from "./MineGrid.module.scss";
import {
  existsCell,
  getGameSize,
  getMineData,
  getMineDataOneDim,
  isLoseCondition,
  loopAdjCells,
  placeCellMark,
  placeMines,
  placeNumAdjMineData,
} from "../../utils/mineSetup";
import {
  CellData,
  GameStateDisplay,
  GameTypesKeys,
} from "../../types/mineTypes";
import { GameSizes } from "../../utils/mineSetupData";
import DigitalDisplay from "../DigitalDisplay/DigitalDisplay";
import DigitalDisplayCountup from "../DigitalDisplayCountup/DigitalDisplayCountup";
import GameSizeChooser from "../GameSizeChooser/GameSizeChooser";
import { GameContext, initialState } from "../../contexts/GameProvider";
import { GameActionType } from "../../types/state";
import GameStateButton from "../GameStateButton/GameStateButton";
0
const MineGrid = () => {
  // const [isGameStarted, setIsGameStarted] = useState(false);
  // const [isGameOver, setIsGameOver] = useState(false);

 // const [mineData, setMineData] = useState<CellData[][]>([]);
  const { state, dispatch } = useContext(GameContext);

  //---use effects
  useEffect(() => {
    const { rows, cols, mines } = getGameSize(state.gridSize);
    let mineDataLocal = getMineData(rows, cols, mines);
    dispatch({ type: GameActionType.GET_MINE_DATA, payload: mineDataLocal });

   // setMineData(getMineData(rows, cols, mines));
  }, []);

  const handleLeftClick = (iRow: number, iCol: number) => {
     // dispatch({
    //   type: GameActionType.CHANGE_GAMESTATE_DISPLAY,
    //   payload: GameStateDisplay.PLAY,
    // });

    if (state.uncoveredCells === 0) {
      // setIsGameStarted(true);
      dispatch({ type: GameActionType.SET_START, payload: true });


      const { rows, cols, mines } = getGameSize(state.gridSize);
      let mineDataLocal = placeMines(state.mineData, rows, cols, mines, iRow, iCol);
      mineDataLocal = placeNumAdjMineData(mineDataLocal);

      dispatch({ type: GameActionType.GET_MINE_DATA, payload: mineDataLocal });

      //setMineData(mineDataLocal);
    }
    goTurn(iRow, iCol);
  };

  const handleLeftOnMouseDown = (iRow: number, iCol: number) => {
    console.log("mousedown");
    dispatch({
      type: GameActionType.CHANGE_GAMESTATE_DISPLAY,
      payload: GameStateDisplay.DANGER,
    });
  };

  const handleRightClick = (iRow: number, iCol: number) => {
    setCellMarkOld(iRow, iCol, state.mineData);

  };

  /**when the timer countup says we are out of time.  */
  const handleTimeout = (msg: string) => {
    console.log(msg);
    //alert(msg);
    onLoseCondition(-1, -1, state.mineData);
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

        //setFlagsPlaced(flagsPlaced + 1);
        dispatch({
          type: GameActionType.INCREMENT_FLAGS_PLACED,
        });
        //its really a flag, the mines are only shown on lose.

        break;
      }
      case "flag": {
        // setFlagsPlaced(flagsPlaced - 1);
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

  //unused...
  const setCellMark = (
    iRow: number,
    iCol: number,
    mineData: CellData[][]
  ): void => {
    console.log("right click?????????????", iRow, iCol);
    let ret = placeCellMark(iRow, iCol, mineData);
    // setFlagsPlaced(ret.flagsPlaced);

    setMineData(ret.mineData);
  };

  /** gridSize dropdown changes, */
  useEffect(() => {
    console.log("gridsized changed.............", state.gridSize);
    resetGrid(state.gridSize);
  }, [state.gridSize]);

  /**
   * may have to reset counters here.
   * @param gridSize
   */
  const resetGrid = (gridSize: GameTypesKeys) => {

    dispatch({
      type: GameActionType.RESET_GAME,
      payload: initialState,
    });

    const { rows, cols, mines } = getGameSize(gridSize);

    let mineDataLocal = getMineData(rows, cols, mines);
    dispatch({ type: GameActionType.GET_MINE_DATA, payload: mineDataLocal });

   // setMineData(getMineData(rows, cols, mines));

    // setIsGameStarted(false);
    // setIsGameOver(false);
   // dispatch({ type: GameActionType.TOGGLE_END });


    dispatch({ type: GameActionType.SET_END, payload: false });

  };

  /**
   * smiley face / frowny face clicked.
   * @param e event of clicked element.
   */
  const handleOnClickResetGrid = () => {
    resetGrid(state.gridSize);
  };

  const goTurn = (iRow: number, iCol: number) => {
    //already lost.
    if (state.isLost) {
      return;
    }

    console.log("clicked row ", iRow, "col", iCol);

    uncoverCell(iRow, iCol, state.mineData, state.gridSize);
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
    gridSize: GameTypesKeys
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

    //setCellsUncovered(cellsUncovered + 1);
    dispatch({
      type: GameActionType.UPDATE_UNCOVER_CELL,
      payload: state.uncoveredCells + 1,
    });

    mineData[iRow][iCol].markedAs = "uncovered";

    uncoverAdjacentZeroSqs(iRow, iCol, mineData);
    //setMineData(mineData);
   
    dispatch({ type: GameActionType.GET_MINE_DATA, payload: mineData });


    let numMines = GameSizes[gridSize].mines;

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
   // setMineData(mineData);
    dispatch({ type: GameActionType.GET_MINE_DATA, payload: mineData });

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
    //should really use the states uncovered length, but i have to make sure it increments on
    //adjacent 0 cells recursively uncovering cells.

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

    uncoverAllCells(state.mineData);

    // setIsGameOver(true);
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
    mineData: CellData[][]
  ) => {
    console.log("onLoseCondition");

    dispatch({ type: GameActionType.TOGGLE_LOST });
    dispatch({ type: GameActionType.SET_END, payload: true });

    //if the game is over not because of click but
    //because of timeout im sending -1 and cell wont exist
    if (existsCell(iRow, iCol, mineData)) {
      mineData[iRow][iCol].markedAs = "exploded";
    }
    uncoverAllCells(mineData);
    window.setTimeout(() => {
      window.alert("boom!");
    }, 500);
  };

  /**
   * probably need to loop via...
   * @param iRow
   * @param iCol
   */
  const uncoverAdjacentZeroSqs = (
    iRow: number,
    iCol: number,
    mineData: CellData[][]
  ) => {
    if (mineData[iRow][iCol].numAdjMines === 0) {
      loopAdjCells(
        iRow,
        iCol,
        mineData,
        (iRow: number, iCol: number, mineData: CellData[][]) => {
          // console.log('cb', mineData, iRow, iCol);

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
              uncoverAdjacentZeroSqs(iRow, iCol, mineData);
            }
          }
        }
      );
    }

    return mineData;
  };

  return (
    <section>
      state.flagsPlaced-------{state.flagsPlaced}
      state.uncoveredCells-------{state.uncoveredCells}
      <GameSizeChooser />
      <article id="wrap-row-digital-display-reset">
       
        <DigitalDisplay
          id={"mines-remaining"}
          displayNum={GameSizes[state.gridSize].mines - state.flagsPlaced}
        ></DigitalDisplay>
        <br />

        <GameStateButton
          gameStateDisplay={state.gameStateDisplay}
          resetGrid={handleOnClickResetGrid}
        ></GameStateButton>

        <DigitalDisplayCountup
          id={"time-counter"}
          timeoutCount={handleTimeout}
          startCount={state.isGameStarted}
          gameOver={state.isGameOver}
        ></DigitalDisplayCountup>
      </article>
      <br />
      <hr className={styles.break} />
      <article>
        {state.mineData.map((row, iRow) => (
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
        ))}
      </article>
    </section>
  );
};

export default MineGrid;
