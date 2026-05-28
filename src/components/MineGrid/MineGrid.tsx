import React, { useContext, useEffect } from "react";
import styles from "./MineGrid.module.scss";
import {
  getMineData,
  goTurn,
  resetGrid,
  setCellMark,
} from "../../utils/mineSetup";
import { GameStateDisplay } from "../../types/mineTypes";
import { GameSizes } from "../../utils/mineSetupData";
import { GameContext, initialState } from "../../contexts/GameProvider";
import { GameActionType } from "../../types/state";
import GameEndOverlay from "../GameEndOverlay/GameEndOverlay";
import MineDataMap from "../MineDataMap/MineDataMap";

type MineGridProps = {
  unlockedDifficultyLabel?: string;
  onGameEnd: (result: "win" | "lose") => void;
  onGameRestart: () => void;
  onUnlockedGameRestart?: () => void;
};

const getDisplayText = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const MineGrid = ({
  unlockedDifficultyLabel,
  onGameEnd,
  onGameRestart,
  onUnlockedGameRestart,
}: MineGridProps) => {
  const { state, dispatch } = useContext(GameContext);
  const minesRemaining = GameSizes[state.gridSize].mines - state.flagsPlaced;

  useEffect(() => {
    if (!state.isGameOver) {
      return;
    }

    onGameEnd(state.isLost ? "lose" : "win");
  }, [onGameEnd, state.isGameOver, state.isLost]);

  /**
   * clicked and run the turn.
   * @param iRow
   * @param iCol
   */
  const handleLeftClick = async (iRow: number, iCol: number) => {
    console.log("mouseUP");

    //already lost.
    if (state.isLost) {
      return;
    }

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
    console.log("mouse down");
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
   * smiley face / frowny face clicked.
   * @param e event of clicked element.
   */
  const handleOnClickResetGrid = () => {
    if (unlockedDifficultyLabel && onUnlockedGameRestart) {
      onUnlockedGameRestart();
      return;
    }

    const localState = { ...initialState, gridSize: state.gridSize };
    resetGrid(dispatch, localState);
    onGameRestart();
  };

  return (
    <section>
      {/* ==================================================================
      minedata new broke, wont put adjacent data{JSON.stringify(state.mineData)}
      <br />
      ====================================================
     unconvered cells {state.uncoveredCells}
      */}
      {/* minedata olde, ineffecting placing mech.  {JSON.stringify(state.mineDataOlde)} */}

      <div className={styles.statusRow}>
        <span>Difficulty: {getDisplayText(state.gridSize)}</span>
        <span>Mines Remaining: {minesRemaining}</span>
      </div>

      <article className={styles.boardWrap}>
        <MineDataMap
          mineData={state.mineData}
          leftClick={handleLeftClick}
          leftOnMouseDown={handleLeftOnMouseDown}
          rightClick={handleRightClick}
        />
      </article>
      {state.isGameOver && (
        <GameEndOverlay
          result={state.isLost ? "lose" : "win"}
          title={
            !state.isLost && unlockedDifficultyLabel
              ? `${unlockedDifficultyLabel} unlocked \uD83D\uDD13`
              : state.isLost
              ? "Boom!"
              : "You won!"
          }
          message={
            state.isLost
              ? "That square was hiding a mine."
              : unlockedDifficultyLabel
              ? "Your next game will start there."
              : "Every safe square is clear."
          }
          onPlayAgain={handleOnClickResetGrid}
          onRedo={handleOnClickResetGrid}
        />
      )}
    </section>
  );
};

export default MineGrid;
