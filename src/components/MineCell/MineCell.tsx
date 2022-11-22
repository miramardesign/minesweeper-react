import React from "react";
import styles from "./MineCell.module.scss";

type MineCellProps = {
  status: string;
  leftClick: () => void;
  rightClick: () => void;
};

const MineCell = ({ status, leftClick, rightClick }: MineCellProps) => {
  const handleOnClick = (e: React.MouseEvent<HTMLElement>) => {
    console.log("click in cell", e);
    leftClick();
  };

  const handleOnContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    console.log("context menu right click in cell", e);
    
    rightClick();
  };

  return (
    <button
      className={styles["title"]}
      onClick={handleOnClick}
      onContextMenu={handleOnContextMenu}
    >
       minecell works! {status}
    </button>
  );
};

export default MineCell;
