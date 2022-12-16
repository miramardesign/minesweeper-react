import React, { useEffect } from "react";
import { CellData } from "../../types/mineTypes";
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
  const handleOnClick = (e: React.MouseEvent<HTMLElement>) => {
    leftClick(iRow, iCol);
  };

  const handleLeftOnMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    leftOnMouseDown(iRow, iCol);
  };

  const handleOnContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    rightClick(iRow, iCol);
  };

  useEffect( () => {
    console.log('cell not showing???', cell);
  }, [cell])

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
    ></button>
  );
};

export default MineCell;
