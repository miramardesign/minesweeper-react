import { useEffect } from "react";
import { CellData } from "../../types/mineTypes";
import MineCell from "../MineCell/MineCell";

type RowDataMapProps = {
  row: CellData[];
  iRow: number;
  leftClick: (iRow: number, iCol: number) => void;
  leftOnMouseDown: (iRow: number, iCol: number) => void;
  rightClick: (iRow: number, iCol: number) => void;
};

const RowDataMap = ({
  row,
  iRow,
  leftClick,
  leftOnMouseDown,
  rightClick,
}: RowDataMapProps) => {


  return (
    <div key={iRow}>
      {row.map((col, iCol) => (
        <MineCell
          key={iCol}
          cell={col}
          iRow={iRow}
          iCol={iCol}
          leftClick={leftClick}
          leftOnMouseDown={leftOnMouseDown}
          rightClick={rightClick}
        ></MineCell>
      ))}
    </div>
  );
};

export default RowDataMap;
