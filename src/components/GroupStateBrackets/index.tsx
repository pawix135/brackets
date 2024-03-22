import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { DataTable } from "../GroupStageDataTable";
import { columns } from "../GroupStageDataTable/columns";
import { useLocation, useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import GameSchedule from "../GameSchedule";
// import { createSchedule } from "@/lib/gameUtils";

interface Props {}

const GroupStateBrackets: React.FC<Props> = () => {
  const { state } = useLocation();

  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>(state.groups);
  const [editMode, setEditMode] = useState<boolean>(false);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  useEffect(() => {
    navigate("/turniej", { replace: true, state: { groups } });
    console.log(groups);
  }, [groups]);

  const calculatedData = useMemo(() => {
    return groups.map((group) => {
      return {
        ...group,
        teams: group.teams.map((team) => {
          const scheduleData = group.schedules.filter((s) => !team.schedules_ids.includes(s.id));

          const playerData = scheduleData.map((s) => {
            return s[s.player_ids[team.id]];
          });

          const w = scheduleData.filter((v) => v.winnerId == team.id).length;
          const r = scheduleData.filter((v) => v.done && v.type == "tie").length;
          const p = scheduleData.filter((v) => v.done && v.winnerId != team.id && v.type != "tie").length;
          const bz = playerData.reduce((p, c) => p + c.bz, 0);
          const bs = playerData.reduce((p, c) => p + c.bs, 0);

          console.log(r, "tie ");

          return {
            ...team,
            bs: bs,
            bz: bz,
            w: w,
            r: r,
            p: p,
            rm: w + r + p,
          };
        }),
      };
    });
  }, [groups]);

  return (
    <>
      <Button onClick={toggleEditMode}>{editMode ? "Zapisz" : "Włącz tryb edycji"}</Button>
      <div className="grid grid-flow-row grid-cols-1 gap-5">
        {calculatedData.map((group, i) => {
          return (
            <div key={`group-${i}`}>
              <DataTable
                groupIndex={i}
                columns={columns}
                data={group.teams}
                groupName={group.name}
                isEditing={editMode}
                setGroups={setGroups}
              />
              <Collapsible className="">
                <CollapsibleTrigger className="pb-2">Harmonogwam rozgrywek {group.name}</CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-1 grid-flow-row md:grid-cols-3 border gap-2 md:gap-5 p-2">
                    {group.schedules.map((schedule, scheduleI) => {
                      return (
                        <GameSchedule
                          isEditing={editMode}
                          key={`schedule-${i}-${scheduleI}`}
                          groupI={i}
                          schedule={schedule}
                          setGroups={setGroups}
                        />
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            // <div key={`group-${i}`} className="flex flex-col border w-full ">
            //   <h3 className="pl-2 border-b-slate-900 border-b-4 py-2">{group.name}</h3>
            //   <div className="flex flex-col ">
            //     {group.teams.map((team, tI) => {
            //       return (
            //         <div
            //           key={`g-${i}-team-${tI}`}
            //           className="flex w-full odd:bg-secondary h-16 items-center px-2 gap-5"
            //         >
            //           <div>{tI + 1}</div>
            //           {editMode ? (
            //             <>
            //               <Input
            //                 type="text"
            //                 value={team.name}
            //                 onChange={(e) => {
            //                   changeTeamName(i, tI, e.target.value);
            //                 }}
            //               />
            //             </>
            //           ) : (
            //             <p className="flex justify-between w-full font-bold">{team.name}</p>
            //           )}

            //         </div>
            //       );
            //     })}
            //   </div>
            // </div>
          );
        })}
      </div>
    </>
  );
};

export default GroupStateBrackets;
