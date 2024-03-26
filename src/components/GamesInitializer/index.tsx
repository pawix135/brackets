import { FormEvent, useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import chunk from 'lodash.chunk';
import shuffle from 'lodash.shuffle';
import { Info, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';
import { createSchedule } from '@/lib/gameUtils';
import { cn } from '@/lib/utils';

const createTeam = (p: TempPlayer): Team => ({
  name: p.name,
  bs: 0,
  bz: 0,
  bz_bs_sum: 0,
  id: p.id,
  p: 0,
  points: 0,
  r: 0,
  rm: 0,
  w: 0,
  schedules_ids: [],
});

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890[];'./!@#$%^&*()-=" as const;

interface TempPlayer {
  id: string;
  name: string;
}

interface Props {}

const GroupInitializer: React.FC<Props> = () => {
  const [playersPerTeam, setPlayersPerTeam] = useState<number>(4);
  const [groupsCount, setGroupsCount] = useState<number>(2);
  const [tempPlayers, setTempPlayers] = useState<TempPlayer[]>([]);
  const [playerInput, setPlayerInput] = useState<string>('');
  const [importInput, setImportInput] = useState<File>();

  const teamsScrollAreaRef = useRef<HTMLDivElement | null>(null);

  const [groups, setGroups] = useState<TempPlayer[][]>(
    Array.from({ length: groupsCount }).fill([]) as never
  );

  const draggedPlayerRef = useRef<number[]>([]);
  const draggOverPlayerRef = useRef<number[]>([]);

  const navigate = useNavigate();

  const addPlayerToList = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (playerInput.length < 1) return;
    setTempPlayers((prev) => [...prev, { id: v4(), name: playerInput.trim() }]);
    setPlayerInput('');
    if (!teamsScrollAreaRef.current) return;
    if (teamsScrollAreaRef.current.childNodes.length > 1) {
      const xd = teamsScrollAreaRef.current.childNodes[1].firstChild as HTMLDivElement;
      xd.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    }
  };

  const loadFile = async () => {
    if (!importInput) return;
    try {
      const temp_players = (await importInput.text())
        .replace(new RegExp(/(\r\n|\n|\r|[[:space:]])/, 'gm'), '')
        .split(',')
        .map((i) => ({ id: v4(), name: i.trim() }));
      setTempPlayers(temp_players);
      console.log(temp_players);
    } catch (error) {
      console.log('Coś poszło nie tak, złe formatowanie pliku');
    }
  };

  const createGroups = () => {
    const temp_groups: Group[] = [];

    for (let i = 0; i < groupsCount; i++) {
      const teams = groups[i].map((player) => createTeam(player));
      const schedules = createSchedule(teams);
      teams.forEach((t) => {
        t.schedules_ids = schedules
          .filter((s) => !Object.keys(s.player_ids).includes(t.id))
          .map((s) => s.id);
      });
      temp_groups.push({
        id: v4(),
        name: `Grupa ${letters[i]}`,
        teams: teams,
        schedules: schedules,
      });
    }

    console.log(temp_groups);

    navigate('/turniej', { state: { groups: temp_groups } });
  };

  const removePlayer = (index: number) => {
    setTempPlayers((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const removePlayerFromGroup = (groupIndex: number, playerIndex: number) => {
    setGroups((prev) => {
      const copy = [...prev];
      const selectedGroup = [...copy[groupIndex]];
      selectedGroup.splice(playerIndex, 1);
      copy[groupIndex] = selectedGroup;
      return copy;
    });
  };

  const onDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    tempPlayerIndex: number,
    groupIndex?: number
  ) => {
    if (groupIndex) {
      draggedPlayerRef.current = [tempPlayerIndex, groupIndex];
    } else {
      draggedPlayerRef.current = [tempPlayerIndex];
    }
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>, groupIndex: number) => {
    draggOverPlayerRef.current = [groupIndex];
  };

  const onDragEnd = (e: React.DragEvent<HTMLDivElement>, fromGroup?: boolean) => {
    e.preventDefault();
    if (draggOverPlayerRef.current.length < 1 || draggedPlayerRef.current.length < 1) return;

    if (groups[draggOverPlayerRef.current[0]].length >= playersPerTeam) {
      console.log('Too many players in team. You shall no pass!');
      return;
    }

    if (fromGroup) {
      console.log('from groups', draggOverPlayerRef.current, draggedPlayerRef.current);

      setGroups((prev) => {
        const copy = [...prev];
        console.log(copy, 'copy');

        const playerIndex = draggedPlayerRef.current[0];
        const groupIndex = draggedPlayerRef.current[1] ?? 0;

        console.log(groupIndex, playerIndex, draggedPlayerRef.current);

        const currentCopy = [...copy[groupIndex]];
        const player = currentCopy.splice(playerIndex, 1);

        const nextCopy = [...copy[draggOverPlayerRef.current[0]]];
        nextCopy.push(player[0]);

        copy[groupIndex] = currentCopy;
        copy[draggOverPlayerRef.current[0]] = nextCopy;

        return copy;
      });
    } else {
      setGroups((prev) => {
        const copy = [...prev];
        const thatArray = [...copy[draggOverPlayerRef.current[0]]];
        thatArray.push(tempPlayers[draggedPlayerRef.current[0]]);
        copy[draggOverPlayerRef.current[0]] = thatArray;

        setTempPlayers((prevTempPlayers) => {
          const playersCopy = [...prevTempPlayers];
          playersCopy.splice(draggedPlayerRef.current[0], 1);
          return playersCopy;
        });

        return copy;
      });
    }

    draggOverPlayerRef.current = [];
    draggedPlayerRef.current = [];
  };

  useEffect(() => {
    if (groups.length < groupsCount) {
      const tempGroups: TempPlayer[][] = [];
      for (let i = groups.length; i < groupsCount; i++) {
        tempGroups.push([]);
      }
      setGroups((prev) => [...prev, ...tempGroups]);
    } else if (groups.length > groupsCount) {
      const groupsCopy = [...groups];
      for (let index = groupsCount; index > groups.length; index--) {
        groupsCopy.pop();
      }
      setGroups(groupsCopy);
    }
  }, [groupsCount]);

  return (
    <div className="max-w-[1400px] border p-2">
      <div>
        <h1>Stwórz grupy</h1>
      </div>
      <div className="flex flex-col gap-5">
        <div className="grid grid-flow-row grid-cols-2 gap-2">
          <div className="space-y-2">
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
          <div className="space-y-2">
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
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3">
          <Label>Nazwa gracza</Label>
          <form className="flex flex-row gap-3" onSubmit={addPlayerToList}>
            <Input
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              type="text"
            />
            <Button type="submit">Dodaj</Button>
          </form>
          <p className="mx-auto">lub importuj liste</p>
          <div className="flex flex-col gap-3">
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
                      Plik w formacie tekstowym, nazwa gracza oddzielona przecinkiem np. dawid,
                      kamil, wojtek, michał.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sticky top-0 left-0 bg-secondary p-2">
          {tempPlayers.length < 1 ? (
            <p>Brak graczy!</p>
          ) : (
            <div className="flex flex-row flex-wrap gap-2 ">
              {tempPlayers.map((player, i) => {
                return (
                  <div
                    key={`tempPlayer-${i}`}
                    className=" px-2 py-1 flex flex-row items-center bg-white text-secondary hover:cursor-grab  gap-5"
                    draggable
                    onDragStart={(e) => onDragStart(e, i)}
                    onDragEnd={(e) => onDragEnd(e)}
                  >
                    {player.name}
                    <X onClick={() => removePlayer(i)} color="red" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-2">
          {Array.from({ length: groupsCount }).map((_, groupIndex) => {
            return (
              <div
                className={cn('min-h-[100px] border')}
                key={`gropu-${groupIndex}`}
                onDragEnter={(e) => onDragEnter(e, groupIndex)}
              >
                <div className="border flex flex-row justify-between p-1">
                  <span>Grupa {letters[groupIndex]}</span>
                  <span>
                    {groups[groupIndex]?.length}/{playersPerTeam}
                  </span>
                </div>
                {groups.length == groupsCount &&
                  groups[groupIndex].map((player, playerIndex) => {
                    return (
                      <div
                        key={`player-${groupIndex}-${playerIndex}`}
                        draggable
                        onClick={() => {
                          console.log(playerIndex, groupIndex);
                        }}
                        onDragStart={(e) => onDragStart(e, playerIndex, groupIndex)}
                        onDragEnd={(e) => onDragEnd(e, true)}
                        className="flex flex-row justify-between odd:bg-secondary p-1 items-center"
                      >
                        <span>{player.name}</span>
                        <Button
                          className="size-[20]"
                          onClick={() => removePlayerFromGroup(groupIndex, playerIndex)}
                        >
                          <X color="red" size={15} />
                        </Button>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
        {/* <pre>{JSON.stringify(groups, null, 2)}</pre> */}
        <Button type="button" onClick={createGroups}>
          Stwórz drabinkę
        </Button>
      </div>
    </div>
  );
};

export default GroupInitializer;
