import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { useState } from "react";

interface Props {
  schedule: GameSchedule;
  isEditing: boolean;
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  groupI: number;
}

const GameSchedule: React.FC<Props> = ({ schedule, isEditing, setGroups, groupI }) => {
  const done = schedule.done;

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [playerOneGoals, setPlayerOneGoals] = useState(schedule.playerOne.bz);
  const [playerTwoGoals, setPlayerTwoGoals] = useState(schedule.playerTwo.bz);

  const save = () => {
    setGroups((prev) => {
      const copy = [...prev];

      const currentSchedule = copy[groupI].schedules.find((s) => s.id === schedule.id);
      if (!currentSchedule) return copy;

      currentSchedule.done = true;
      currentSchedule.playerOne.bs = playerTwoGoals;
      currentSchedule.playerOne.bz = playerOneGoals;

      currentSchedule.playerTwo.bs = playerOneGoals;
      currentSchedule.playerTwo.bz = playerTwoGoals;

      if (playerOneGoals > playerTwoGoals) {
        currentSchedule.type = "won";
        currentSchedule.winnerId = currentSchedule.playerOne.id;
      } else if (playerOneGoals == playerTwoGoals) {
        currentSchedule.type = "tie";
      } else {
        currentSchedule.type = "won";
        currentSchedule.winnerId = currentSchedule.playerTwo.id;
      }

      return copy;
    });

    setOpenDialog(false);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col bg-secondary divide-y divide-white px-2">
        <div className="flex flex-row justify-between p-2">
          <span>{schedule.playerOne.name}</span>
          <span
            className={cn("bg-primary px-2 text-secondary", {
              "bg-green-500": schedule.playerOne.bz > schedule.playerTwo.bz && done,
              "bg-orange-500": schedule.playerOne.bz == schedule.playerTwo.bz && done,
              "bg-red-500": schedule.playerOne.bz < schedule.playerTwo.bz && done,
              "text-white": done,
            })}
          >
            {schedule.playerOne.bz}
          </span>
        </div>
        <div className="flex flex-row justify-between p-2">
          <span>{schedule.playerTwo.name}</span>
          <span
            className={cn("bg-primary px-2 text-secondary", {
              "bg-green-500": schedule.playerTwo.bz > schedule.playerOne.bz && done,
              "bg-orange-500": schedule.playerTwo.bz == schedule.playerOne.bz && done,
              "bg-red-500": schedule.playerTwo.bz < schedule.playerOne.bz && done,
              "text-white": done,
            })}
          >
            {schedule.playerTwo.bz}
          </span>
        </div>
        {/* <pre>{JSON.stringify(schedule, null, 2)}</pre> */}
      </div>
      {isEditing && (
        <>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger className="w-full h-5" asChild>
              <Button>Edytuj</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Zmień wynik meczu</DialogTitle>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-row justify-between">
                    <div>
                      <h3>{schedule.playerOne.name}</h3>
                      <Input
                        type="number"
                        value={playerOneGoals}
                        step={1}
                        onChange={(e) => setPlayerOneGoals(parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <h3>{schedule.playerTwo.name}</h3>
                      <Input
                        type="number"
                        value={playerTwoGoals}
                        step={1}
                        onChange={(e) => setPlayerTwoGoals(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <Button onClick={save}>Zapisz</Button>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default GameSchedule;
