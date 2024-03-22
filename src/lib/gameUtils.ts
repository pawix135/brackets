import shuffle from "lodash.shuffle";
import { v4 } from "uuid";

export const createSchedule = (teams: Team[]): GameSchedule[] => {
  const schedule: GameSchedule[] = [];
  const numTeams = teams.length;

  // Generate all possible pairs of teams
  const pairs: [Team, Team][] = [];
  for (let i = 0; i < numTeams; i++) {
    for (let j = i + 1; j < numTeams; j++) {
      pairs.push([teams[i], teams[j]]);
    }
  }

  // Create the game schedules
  for (let i = 0; i < pairs.length; i++) {
    const [team1, team2] = pairs[i];
    const game: GameSchedule = {
      id: v4(),
      done: false,
      player_ids: {
        [team1.id]: "playerOne",
        [team2.id]: "playerTwo",
      },
      playerOne: {
        id: team1.id,
        bs: 0,
        bz: 0,
        name: team1.name,
      },
      playerTwo: {
        id: team2.id,
        bs: 0,
        bz: 0,
        name: team2.name,
      },
    };
    schedule.push(game);
  }

  return shuffle(schedule);
};
