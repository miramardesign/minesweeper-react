import React, { useEffect, useState } from "react";
import MineCell from "../MineCell/MineCell";
import styles from "./MineGrid.module.scss";
import {  getMineData  } from "../../utils/mineSetup";
import { CellData, GameSizes, GameTypes } from "../../types/mineTypes";

const MineGrid = () => {
  const [cell, setCell] = useState({});

  const [mineData, setMineData] = useState<CellData[][]>([]);
  useEffect(() => {

    let gameSizeChosen = 'beginner';

    let numRows = GameSizes[gameSizeChosen as keyof GameTypes].rows;
    let numCols = GameSizes[gameSizeChosen as keyof GameTypes].cols;
    let numMines = GameSizes[gameSizeChosen as keyof GameTypes].mines;

    setMineData(getMineData(numRows, numCols, numMines));
  }, []);

  const handleLeftClick = (iRow: number, iCol: number) => {
    console.log("left click yo", mineData, iRow, iCol);
    setCell("left click yo, mineData:");
  };
  const handleRightClick = () => {
    console.log("right click yo");
    setCell("right click yo");
  };

  return (
    <section>
      {mineData.map((row, iRow) => (
        <div key={iRow}>
          {row.map((col, iCol) => (
            <MineCell
              key={iCol}
              cell={col}
              iRow={iRow}
              iCol={iCol}
              leftClick={handleLeftClick}
              rightClick={handleRightClick}
            ></MineCell>
          ))}
        </div>
      ))}
    </section>
  );
};

export default MineGrid;

// was in ng
/* component 
<section class="wrap-mine" [ngClass]="'win-' + isLose + ' win-type-' ">
    <div class="row" *ngFor="let row of mineData; let iRow = index">
        <button *ngFor="let cell of row; let iCol = index" class="square" [ngClass]="'mine-' + cell?.hasMine + ' mark-' + cell.markedAs +
    ' uncovered-' + cell.uncovered + ' cell-num-adj-' + cell.numAdjMines  " (click)="goTurn(iRow, iCol )"
            (mouseup)="onMiddleClick($event, iRow, iCol)" (contextmenu)="onRightClick(iRow, iCol)">
        </button>
    </div>
</section>
*/
