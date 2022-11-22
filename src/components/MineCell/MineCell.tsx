import React from "react";
import styles from "./MineCell.module.scss";

type MineCellProps = {
  status: string;
  iRow: number;
  iCol: number;
  leftClick: (iRow: number, iCol: number) => void;
  rightClick: (iRow: number, iCol: number) => void;
};

const MineCell = ({
  status,
  leftClick,
  rightClick,
  iRow,
  iCol,
}: MineCellProps) => {
  const handleOnClick = (e: React.MouseEvent<HTMLElement>) => {
    console.log("click in cell", e);
    leftClick(iRow, iCol);
  };

  const handleOnContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    console.log("context menu right click in cell", e);

    rightClick(iRow, iCol);
  };

  return (
    <button
      className={styles["title"]}
      onClick={handleOnClick}
      onContextMenu={handleOnContextMenu}
    >
      {status ? "💣" : "[]"}
    </button>
  );
};

export default MineCell;
