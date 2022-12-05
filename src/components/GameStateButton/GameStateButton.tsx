import React from "react";
import styles from "./GameStateButton.module.scss";

type GameStateButtonProps = {
  gameStateDisplay: string;
  resetGrid: () => void;
};

const GameStateButton = ({
    gameStateDisplay,
    resetGrid,
}: GameStateButtonProps) => {

  const handleOnClickResetGrid = () => {

    console.log("reset button hit");
    resetGrid();
  };

  return (
    <div id="reset" className={styles["wrap-reset"]}>

      <button className={"square"} onClick={handleOnClickResetGrid}>
        
        {gameStateDisplay && <span>{gameStateDisplay}</span>}
      </button>
    </div>
  );
};

export default GameStateButton;
