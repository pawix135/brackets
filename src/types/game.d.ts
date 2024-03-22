interface Group {
  id: string;
  name: string;
  teams: Team[];
  schedules: GameSchedule[];
}

interface Team {
  id: string;
  name: string;
  rm: number;
  w: number;
  r: number;
  p: number;
  points: number;
  bz: number;
  bs: number;
  bz_bs_sum: number;
  schedules_ids: string[];
}

type OnlyNumbers<T> = {
  [K in keyof T as T[K] extends number ? K : never]: T[K];
};

type TeamNumbers = OnlyNumbers<Team>;

interface GameSchedule {
  id: string;
  done: boolean;
  type?: "tie" | "won";
  winnerId?: string;
  player_ids: { [key: string]: "playerOne" | "playerTwo" };
  playerOne: {
    id: string;
    bs: number;
    bz: number;
    name: string;
  };
  playerTwo: {
    id: string;
    bs: number;
    bz: number;
    name: string;
  };
}
