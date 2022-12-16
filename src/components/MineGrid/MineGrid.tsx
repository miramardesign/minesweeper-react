import React, { useContext } from "react";
import styles from "./MineGrid.module.scss";
import {
 
  getMineData,
  goTurn,
  onLoseCondition,
  resetGrid,
  setCellMark,
} from "../../utils/mineSetup";
import {
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
import MineDataMap from "../MineDataMap/MineDataMap";

const MineGrid = () => {
  const { state, dispatch } = useContext(GameContext);

  /**
   * clicked and run the turn.
   * @param iRow
   * @param iCol
   */
  const handleLeftClick = async (iRow: number, iCol: number) => {

    let mineData = state.mineData;
    if (state.uncoveredCells === 0) {
      dispatch({ type: GameActionType.SET_START, payload: true });
      mineData = await getMineData(iRow, iCol, state);
      dispatch({ type: GameActionType.SET_MINE_DATA, payload: mineData });

    }
    goTurn(iRow, iCol, mineData, state, dispatch);
  };

  /**
   * just changes display :) :() :( Gamestatedisplay.
   */
  const handleLeftOnMouseDown = () => {
    dispatch({
      type: GameActionType.CHANGE_GAMESTATE_DISPLAY,
      payload: GameStateDisplay.DANGER,
    });
  };

  /**
   * set a marker on right click.
   * @param iRow
   * @param iCol
   */
  const handleRightClick = (iRow: number, iCol: number) => {
    //has a small bug on 3rd clic..
    setCellMark(iRow, iCol, state.mineData, dispatch);
  };

  /**
   * when the timer countup says we are out of time.
   * @param msg
   */
  const handleTimeout = (msg: string) => {
    console.log(msg);
    onLoseCondition(-1, -1, state.mineData, dispatch);
  };

  /**
   * smiley face / frowny face clicked.
   * @param e event of clicked element.
   */
  const handleOnClickResetGrid = () => {
    const localState = { ...initialState, gridSize: state.gridSize };
    resetGrid(dispatch, localState);
  };

  /** gridSize dropdown changes, */
  const handleOnChangeSize = (gridSize: GameTypesKeys) => {
    console.log("size changed", gridSize);
    console.log("gridsized changed.........to....", gridSize);
    const localState = { ...initialState, gridSize: gridSize };
    resetGrid(dispatch, localState);
  };

  return (

    <section>
      ==================================================================
      minedata new broke, wont put adjacent data{JSON.stringify(state.mineData)}
      <br />
      ====================================================
     unconvered cells {state.uncoveredCells}
     
     {/* minedata olde, ineffecting placing mech.  {JSON.stringify(state.mineDataOlde)} */}

      <GameSizeChooser chooseGameSize={handleOnChangeSize} />
      <article id="wrap-row-digital-display-reset">
        <DigitalDisplay
          id={"mines-remaining"}
          displayNum={GameSizes[state.gridSize].mines - state.flagsPlaced}
        ></DigitalDisplay>
        <br />
        <GameStateButton
          gameStateDisplay={state.gameStateDisplay}
          resetGrid={handleOnClickResetGrid}
        />

        <DigitalDisplayCountup
          id={"time-counter"}
          timeoutCount={handleTimeout}
          startCount={state.isGameStarted}
          gameOver={state.isGameOver}
        />
      </article>
      <br />
      <hr className={styles.break} />
      <article>
        <MineDataMap
          mineData={state.mineData}
          leftClick={handleLeftClick}
          leftOnMouseDown={handleLeftOnMouseDown}
          rightClick={handleRightClick}
        />
      </article>
    </section>
  );
};

export default MineGrid;
