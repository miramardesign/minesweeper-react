import React, { useEffect, useState } from "react";
import MineCell from "../MineCell/MineCell";
import styles from "./MineGrid.module.scss";
import { getMineData, isMine } from "../../utils/mineSetup";
import { CellData, GameTypes } from "../../types/mineTypes";
import { GameSizes } from "../../utils/mineSetupData";

const MineGrid = () => {
  const [cell, setCell] = useState({});

  const [mineData, setMineData] = useState<CellData[][]>([]);
  const [gridSize, setGridSize] = useState("beginner");
  const [isLose, setIsLose] = useState(false);

  useEffect(() => {
    let numRows = GameSizes[gridSize as keyof GameTypes].rows;
    let numCols = GameSizes[gridSize as keyof GameTypes].cols;
    let numMines = GameSizes[gridSize as keyof GameTypes].mines;

    setMineData(getMineData(numRows, numCols, numMines));
  }, []);

  const handleLeftClick = (iRow: number, iCol: number) => {
    console.log("left click yo", mineData, iRow, iCol);
    goTurn(iRow, iCol);
    setCell("left click yo, mineData:");
  };
  const handleRightClick = () => {
    console.log("right click yo");
    setCell("right click yo");
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("Size Selected!!", e.target.value);
    setGridSize(e.target.value);
  };

  /** gridSize dropdown changes, */
  useEffect(() => {
    console.log("gridsized changed.............", gridSize);
    resetGrid(gridSize);
  }, [gridSize]);

  /**
   * may have to reset counters here.
   * @param gridSize 
   */
  const resetGrid = (gridSize: String) => {
    let numRows = GameSizes[gridSize as keyof GameTypes].rows;
    let numCols = GameSizes[gridSize as keyof GameTypes].cols;
    let numMines = GameSizes[gridSize as keyof GameTypes].mines;

    setMineData(getMineData(numRows, numCols, numMines));
  };

  const handleOnClickResetGrid = (e: React.MouseEvent<HTMLElement>) => {
    resetGrid(gridSize);
  };

  const goTurn = (iRow: number, iCol: number) => {
    //already lost.
    if (isLose) {
      return;
    }

    console.log('clicked row ', iRow, 'col', iCol);

    if (isMine(iRow, iCol, mineData)) {
      onLoseCondition(iRow, iCol, mineData);
    } else {
     // uncoverCell(iRow, iCol);
    }
  }

  const onLoseCondition = (iRow: number, iCol: number, mineData: CellData[][]) => {
    setIsLose(true);
    // this.mineData[iRow][iCol].markedAs = 'exploded';
    // uncoverAllCells(mineData);
    window.setTimeout(() => {
      window.alert('boom!');
    }, 500);
  }



  return (
    <section>

      {/* TODO: componentize below */}
      {/* <span class="mine-counter"> Mines placed {{minesPlaced}}</span> */}

   
      {/* TODO: componentize below */}
      <div className={styles['wrap-reset']}>
        {isLose &&
           <button className={'square'} onClick={handleOnClickResetGrid}>:&#40;</button>
        }
        {!isLose &&
           <button className={'square'} onClick={handleOnClickResetGrid}>:&#41;</button>
        }
       
      </div>

      {/* TODO: componentize below */}
      {/* <span class="mark-counter"> Flags placed {flagsPlaced}</span> */}

      {/* TODO: componentize below */}
      <select onChange={handleSizeChange}>
        {Object.keys(GameSizes).map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
 
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
