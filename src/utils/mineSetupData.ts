import { GameTypes } from "../types/mineTypes";

export const GameSizes: GameTypes = {
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


 