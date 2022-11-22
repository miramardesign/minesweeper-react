import React, { useState} from "react";
import MineCell from "../MineCell/MineCell";
import styles from "./MineGrid.module.scss";

const MineGrid = () => {

const [status, setStatus] = useState('default state');

 

  const handleLeftClick = () => {
    console.log("left click yo");
    setStatus('left click yo');

  };
  const handleRightClick = () => {
    console.log("right click yo");
    setStatus('right click yo');
  };

  return (
    <React.Fragment>

      <MineCell
        status={status}
        leftClick={handleLeftClick}
        rightClick={handleRightClick}
      ></MineCell>
    </React.Fragment>
  );
};

export default MineGrid;
