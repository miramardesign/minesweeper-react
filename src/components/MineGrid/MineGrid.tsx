import React, { useContext, useEffect, useState } from "react";
import styles from "./MineGrid.module.scss";
import {
  getGameSize,
  getGridDataStructure,
  getMineData,
  goTurn,
  onLoseCondition,
  resetGrid,
  setCellMark,
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
import {  GameActionType } from "../../types/state";
import GameStateButton from "../GameStateButton/GameStateButton";
import MineDataMap from "../MineDataMap/MineDataMap";

const MineGrid = () => {
  const { state, dispatch } = useContext(GameContext);

  //component load setup.
  useEffect(() => {
    const { rows, cols, mines } = getGameSize(state.gridSize);
    let mineData: CellData[][] = getGridDataStructure(rows, cols, mines);
    dispatch({ type: GameActionType.SET_MINE_DATA, payload: mineData });
  }, []);

  /**
   * clicked and run the turn.
   * @param iRow 
   * @param iCol 
   */
  const handleLeftClick = (iRow: number, iCol: number) => {
    if (state.uncoveredCells === 0) {
      dispatch({ type: GameActionType.SET_START, payload: true }); 
      getMineData(iRow, iCol, state, dispatch);     
    }
    goTurn(iRow, iCol, state, dispatch);
  };

  /**
   * just changes display :) :() :( Gamestatedisplay.
   * @param iRow 
   * @param iCol 
   */
  const handleLeftOnMouseDown = (iRow: number, iCol: number) => {
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
    const localState = {...initialState, gridSize: state.gridSize};

    resetGrid(dispatch, localState);
  };

    /** gridSize dropdown changes, */
  const handleOnChangeSize = (gridSize: GameTypesKeys) => {
    console.log('size changed', gridSize );
    //useEffect(() => {
      console.log("gridsized changed.........to....", gridSize);
      const localState = {...initialState, gridSize: gridSize};
      resetGrid( dispatch, localState);
    //resetGrid(dispatch, initialState);
  };

  return (
    <section>
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
