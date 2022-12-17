import { GameTypes, PerimeterDirectionsOffsets } from "../types/mineTypes";

export const GameSizes: GameTypes = {
    test:  {
      rows: 5,
      cols: 5,
      mines: 24,
    },
    beginner:  {
      rows: 8,
      cols: 8,
      mines: 10,
    },
    intermediate: {
      rows: 16,
      cols: 16,
      mines: 40,
    },
    expert: {
      rows: 16,
      cols: 30,
      mines: 99,
    },
  };


/**
 * basically defines the relative position of the directions.
 * so i could loop thru them instead of hard-coding.
 */
export const PERIMETER_CELLS_OFFSETS: PerimeterDirectionsOffsets = {
  northWest: {
    iRow: -1,
    iCol: -1,
  },
  north: {
    iRow: -1,
    iCol: 0,
  },
  northEast: { iRow: -1, iCol: 1 },

  west: { iRow: 0, iCol: -1 },
  east: { iRow: 0, iCol: 1 },

  southWest: {
    iRow: 1,
    iCol: -1,
  },
  south: {
    iRow: 1,
    iCol: 0,
  },
  southEast: { iRow: 1, iCol: 1 },
};
 
 