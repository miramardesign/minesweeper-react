import React, { useContext } from "react";
import { GameContext } from "../../contexts/GameProvider";
import { CellData, GameStateDisplay } from "../../types/mineTypes";
import { GameActionType } from "../../types/state";
import styles from "./MineCell.module.scss";

type MineCellProps = {
  cell: CellData;
  iRow: number;
  iCol: number;
  leftClick: (iRow: number, iCol: number) => void;
  leftOnMouseDown: (iRow: number, iCol: number) => void;
  rightClick: (iRow: number, iCol: number) => void;
};

const MineCell = ({
  cell,
  leftClick,
  leftOnMouseDown,
  rightClick,
  iRow,
  iCol,
}: MineCellProps) => {

  const { state, dispatch } = useContext(GameContext);

  const handleOnClick = (e: React.MouseEvent<HTMLElement>) => {
    // console.log("click in cell", e);

    dispatch({
      type: GameActionType.CHANGE_GAMESTATE_DISPLAY,
      payload: GameStateDisplay.PLAY,
    });


    leftClick(iRow, iCol);
  };

  const handleLeftOnMouseDown
   = (e: React.MouseEvent<HTMLElement>) => {
    // console.log("click in leftOnMouseDown", e);
    leftOnMouseDown(iRow, iCol);
  };

  const handleOnContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    // console.log("context menu right click in cell", e);

    rightClick(iRow, iCol);
  };

  //other way to add class conditionally. 
  // ${styles[`${cell.hasMine && 'bomb'}`]}

  return (
    <button
      className={`
      ${styles[`square`]}
      ${styles[`mine-${cell.hasMine}`]}
      ${styles[`mark-${cell.markedAs}`]}
      ${styles[`uncovered-${cell.uncovered}`]}
    
      ${styles[`cell-num-adj-${cell.numAdjMines}`]}
   
       `}
      onClick={handleOnClick}
      onMouseDown={handleLeftOnMouseDown}

      onContextMenu={handleOnContextMenu}
    >
     </button>
  );
};

export default MineCell;
