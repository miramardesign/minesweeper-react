import React from "react";
import { GameTypesKeys } from "../../types/mineTypes";
import { GameSizes } from "../../utils/mineSetupData";
import styles from "./GameSizeChooser.module.scss";

type GameSizeChooserProps = {
  onGameSizeChange: (gameSizeName: GameTypesKeys) => void;
};

const GameSizeChooser = ({ onGameSizeChange }: GameSizeChooserProps) => {
  const handleGameSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onGameSizeChange(e.target.value as GameTypesKeys);
  };

  return (
    <select
      id="choose-game-size"
      className={styles["wide"]}
      onChange={handleGameSizeChange}
    >
      {Object.keys(GameSizes).map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
  );
};

export default GameSizeChooser;