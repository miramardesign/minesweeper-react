import { useState } from "react";
import "./App.css";
import MineGrid from "./components/MineGrid/MineGrid";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <h1>Minesweeper React</h1>

      {/* component  */}
      {/* <span class="mine-counter"> Mines placed {{minesPlaced}}</span> */}

      {/* component  */}

      {/* <article class="wrap-reset">
          <button class="square" *ngIf="isLose" (click)="reset()">:(</button>
          <button class="square" *ngIf="!isLose" (click)="reset()">:)</button>
      </article> */}

      {/* component  */}

      {/* <span class="mark-counter"> Flags placed {flagsPlaced}</span> */}

      {/* component  

      <select (change)="reset()" [(ngModel)]="gameSizeChosen">
        <option [value]="'beginner'">Beginner</option>
        <option [value]="'intermediate'">Intermediate</option>
        <option [value]="'expert'">Expert</option>
      </select>
      */}

      {/* component 
      <section class="wrap-mine" [ngClass]="'win-' + isLose + ' win-type-' ">
        <div class="row" *ngFor="let row of mineData; let iRow = index">
            <button *ngFor="let cell of row; let iCol = index" class="square" [ngClass]="'mine-' + cell?.hasMine + ' mark-' + cell.markedAs +
        ' uncovered-' + cell.uncovered + ' cell-num-adj-' + cell.numAdjMines  " (click)="goTurn(iRow, iCol )"
                (mouseup)="onMiddleClick($event, iRow, iCol)" (contextmenu)="onRightClick(iRow, iCol)">
            </button>
        </div>
    
       */}

       <MineGrid></MineGrid>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
    
      </div>
    </div>
  );
}

export default App;
