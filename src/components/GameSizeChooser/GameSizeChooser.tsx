import React, { useContext } from "react";
import { GameContext } from "../../contexts/GameProvider";
import { GameTypesKeys } from "../../types/mineTypes";
import { GameActionType } from "../../types/state";
import { GameSizes } from "../../utils/mineSetupData";
import styles from "./GameSizeChooser.module.scss";

const GameSizeChooser = () => {

  const {  dispatch } = useContext(GameContext);

  const handleGameSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch( {type: GameActionType.CHOOSE_SIZE, payload: e.target.value as GameTypesKeys})
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