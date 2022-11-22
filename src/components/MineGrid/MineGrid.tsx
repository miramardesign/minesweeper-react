import React, { useEffect, useState } from "react";
import MineCell from "../MineCell/MineCell";
import styles from "./MineGrid.module.scss";

const MineGrid = () => {
  const [status, setStatus] = useState("default state");

  //move interfaces to separate files.
  interface CellData {
    hasMine: boolean;
    markedAs: string;
    uncovered: boolean;
    numAdjMines: number;
  }

  const [mineData, setMineData] = useState<CellData[][]>([]);
  useEffect(() => {
    /**
     * generares an array with random mines and set h and w
     * @param numRows
     * @param numCols
     * @param numMines
     * @returns
     */
    const getMineData = (
      numRows: number,
      numCols: number,
      numMines: number
    ) => {
      // let numRows = this.gameSizes[this.gameSizeChosen as keyof GameTypes].rows;
      // let numCols = this.gameSizes[this.gameSizeChosen as keyof GameTypes].cols;
      // let numMines = this.gameSizes[this.gameSizeChosen as keyof GameTypes].mines;

      let mineData = new Array(numRows).fill([]).map(() => {
        return new Array(numCols).fill({}).map((element: CellData) => {
          return {
            hasMine: false,
            markedAs: "",
            uncovered: false,
            numAdjMines: 0,
          };
        });
      });

      // mineData = this.placeMines(mineData, numRows, numCols, numMines);

      return mineData;
    };

    setMineData(getMineData(5, 5, 4));
  }, []);

  const handleLeftClick = (iRow: number, iCol:number) => {
    console.log("left click yo", mineData, iRow, iCol);
    setStatus("left click yo, mineData:");
  };
  const handleRightClick = () => {
    console.log("right click yo");
    setStatus("right click yo");
  };

  return (
    <section>
      {mineData.map((row, iRow) => (
        <div key={iRow}>
          {row.map((col, iCol) => (     
              <MineCell key={iCol}
                status={'hello' + col.hasMine.toString()}
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

// was

/* component 
      <section class="wrap-mine" [ngClass]="'win-' + isLose + ' win-type-' ">
        <div class="row" *ngFor="let row of mineData; let iRow = index">
            <button *ngFor="let cell of row; let iCol = index" class="square" [ngClass]="'mine-' + cell?.hasMine + ' mark-' + cell.markedAs +
        ' uncovered-' + cell.uncovered + ' cell-num-adj-' + cell.numAdjMines  " (click)="goTurn(iRow, iCol )"
                (mouseup)="onMiddleClick($event, iRow, iCol)" (contextmenu)="onRightClick(iRow, iCol)">
            </button>
        </div>
    
       */
