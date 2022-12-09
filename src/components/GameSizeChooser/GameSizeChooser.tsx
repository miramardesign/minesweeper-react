import React, { useContext } from "react";
import { GameContext } from "../../contexts/GameProvider";
import { GameTypesKeys } from "../../types/mineTypes";
import { GameActionType } from "../../types/state";
import { GameSizes } from "../../utils/mineSetupData";
import styles from "./GameSizeChooser.module.scss";

type GameSizeChooserProps = {
  chooseGameSize: (value: GameTypesKeys) => void;
};

const GameSizeChooser = ({ chooseGameSize }: GameSizeChooserProps) => {
  const handleChooseGameSizeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    chooseGameSize(e.target.value as GameTypesKeys);
  };

  return (
    <select
      id="choose-game-size"
      className={styles["wide"]}
      onChange={handleChooseGameSizeChange}
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
