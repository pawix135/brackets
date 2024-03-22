import { FormEvent, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import chunk from "lodash.chunk";
import shuffle from "lodash.shuffle";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Info, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { createSchedule } from "@/lib/gameUtils";

const createTeam = (name: string): Team => ({
  name,
  bs: 0,
  bz: 0,
  bz_bs_sum: 0,
  id: v4(),
  p: 0,
  points: 0,
  r: 0,
  rm: 0,
  w: 0,
  schedules_ids: [],
});

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890[];'./!@#$%^&*()-=" as const;

interface Props {}

const GroupInitializer: React.FC<Props> = () => {
  const [playersPerTeam, setPlayersPerTeam] = useState<number>(1);
  const [groupsCount, setGroupsCount] = useState<number>(4);
  const [players, setPlayers] = useState<string[]>([]);
  const [playerInput, setPlayerInput] = useState<string>("");
  const [importInput, setImportInput] = useState<File>();
  const teamsScrollAreaRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const addPlayerToList = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (playerInput.length < 1) return;
    setPlayers((prev) => [...prev, playerInput.trim()]);
    setPlayerInput("");
    if (!teamsScrollAreaRef.current) return;
    if (teamsScrollAreaRef.current.childNodes.length > 1) {
      const xd = teamsScrollAreaRef.current.childNodes[1].firstChild as HTMLDivElement;
      xd.scrollIntoView({ behavior: "smooth", block: "end", inline: "end" });
    }
  };

  const loadFile = async () => {
    if (!importInput) return;
    try {
      const temp_players = (await importInput.text())
        .replace(new RegExp(/(\r\n|\n|\r|[[:space:]])/, "gm"), "")
        .split(",")
        .map((i) => i.trim());
      setPlayers(temp_players);
      console.log(temp_players);
    } catch (error) {
      console.log("Coś poszło nie tak, złe formatowanie pliku");
    }
  };

  const createGroups = () => {
    if (players.length < 1) return;

    const temp_groups: Group[] = [];

    const shufflePlayers = chunk(shuffle(players), playersPerTeam);

    while (shufflePlayers.length < groupsCount) {
      //@ts-expect-error Typescript error
      shufflePlayers.push(Array.from({ length: playersPerTeam }).fill("Zmień nazwę"));
    }

    for (let index = 0; index < shufflePlayers.length; index++) {
      while (shufflePlayers[index].length < playersPerTeam) {
        shufflePlayers[index].push("Zmień nazwę");
      }
    }

    for (let i = 0; i < groupsCount; i++) {
      const teams = shufflePlayers[i].map((player) => createTeam(player));
      const schedules = createSchedule(teams);
      teams.forEach((t) => {
        t.schedules_ids = schedules.filter((s) => !Object.keys(s.player_ids).includes(t.id)).map((s) => s.id);
      });
      temp_groups.push({
        id: v4(),
        name: `Grupa ${letters[i]}`,
        teams: teams,
        schedules: schedules,
      });
    }

    navigate("/turniej", { state: { groups: temp_groups } });
  };

  const removePlayer = (index: number) => {
    setPlayers((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  return (
    <Card className="max-w-[500px] shadow-md">
      <CardHeader>
        <CardTitle>Stwórz grupy</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <Label htmlFor="players_count">Ilość graczy w grupie</Label>
          <Input
            id="players_count"
            value={playersPerTeam}
            onChange={(e) => setPlayersPerTeam(parseInt(e.target.value))}
            type="number"
            step={1}
            min={1}
          />
        </div>
        <div>
          <Label htmlFor="groups_count">Ilość grup</Label>
          <Input
            id="groups_count"
            value={groupsCount}
            onChange={(e) => setGroupsCount(parseInt(e.target.value))}
            type="number"
            step={1}
            min={1}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label>Gracze</Label>
          <form className="flex flex-row gap-3" onSubmit={addPlayerToList}>
            <Input value={playerInput} onChange={(e) => setPlayerInput(e.target.value)} type="text" />
            <Button type="submit">Dodaj</Button>
          </form>
          <div className="flex flex-col gap-3">
            <p>lub importuj</p>
            <div className="flex flex-row gap-3">
              <Input
                type="file"
                accept=".txt"
                onChange={(e) => {
                  if (!e.target.files || e.target.files.length < 1) return;
                  setImportInput(e.target.files[0]);
                }}
                className="max-w-[300px]"
              />
              <Button onClick={loadFile}>Załaduj</Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[300px] text-justify">
                      Plik w formacie tekstowym, nazwa gracza oddzielona przecinkiem np. dawid, kamil, wojtek, michał.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex flex-col gap-2 ">
            {players.length < 1 ? (
              <p>Brak graczy!</p>
            ) : (
              <ScrollArea className="h-[300px]" ref={teamsScrollAreaRef}>
                {players.map((player, i) => {
                  return (
                    <div
                      key={`player-${i}`}
                      className="flex flex-row justify-between items-center odd:bg-secondary p-2"
                    >
                      <p className="font-bold">{player}</p>
                      <Button variant={"outline"} onClick={() => removePlayer(i)}>
                        <X color="red" />
                      </Button>
                    </div>
                  );
                })}
              </ScrollArea>
            )}
          </div>
        </div>
        <Button type="button" onClick={createGroups}>
          Stwórz drabinkę
        </Button>
      </CardContent>
    </Card>
  );
};

export default GroupInitializer;
