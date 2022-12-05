import { CellData } from "../../types/mineTypes";
import RowDataMap from "../RowDataMap/RowDataMap";

type MineDataMapProps = {
  mineData: CellData[][];
  leftClick: (iRow: number, iCol: number) => void;
  leftOnMouseDown: (iRow: number, iCol: number) => void;
  rightClick: (iRow: number, iCol: number) => void;
};

const MineDataMap = ({
  mineData,
  leftClick,
  leftOnMouseDown,
  rightClick,
}: MineDataMapProps) => {

  return (
    <article>
      {mineData.map((row, iRow) => (
        <RowDataMap
          key={iRow}
          row={row}
          iRow={iRow}
          leftClick={leftClick}
          leftOnMouseDown={leftOnMouseDown}
          rightClick={rightClick}
        ></RowDataMap>
      ))}

      <br />
    </article>
  );
};

export default MineDataMap;
