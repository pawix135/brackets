import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  groupName: string;
  isEditing: boolean;
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  groupIndex: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  groupName,
  isEditing,
  setGroups,
  groupIndex,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      isEditing,
      groupName,
      changeByOne(teamIndex, key, by) {
        const copy = [...data] as Team[];
        if (by == "up") copy[teamIndex][key] += 1;
        else {
          if (copy[teamIndex][key] === 0) copy[teamIndex][key] = 0;
          else copy[teamIndex][key] -= 1;
        }
        setGroups((prev) => {
          const groupCopy = [...prev];
          groupCopy[groupIndex].teams = copy;
          return groupCopy;
        });
      },
      oneUp(teamIndex, key) {
        const copy = [...data] as Team[];
        copy[teamIndex][key] += 1;
        console.log(copy[teamIndex][key]);

        setGroups((prev) => {
          const groupCopy = [...prev];
          groupCopy[groupIndex].teams = copy;
          console.log(groupCopy[groupIndex].teams);

          return groupCopy;
        });
      },
      updateData(rowIndex, columnId) {
        const value = prompt("Zmień dane");
        if (!value) return;
        alert(`${rowIndex}, ${columnId}, ${value}`);
        const copy = [...data] as Team[];
        console.log(copy[rowIndex]);
        copy[rowIndex][columnId] = parseInt(value) as never;
        console.log(copy[rowIndex]);

        setGroups((prev) => {
          const groupCopy = [...prev];
          groupCopy[groupIndex].teams = copy;
          return groupCopy;
        });
      },
    },
  });

  return (
    <div className="rounded-md">
      <Table className="border-x border-t">
        <TableHeader className=" ">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="">
              {headerGroup.headers.map((header) => {
                const colSpan = header.column.columnDef.meta?.colSpan;
                return (
                  <TableHead
                    key={header.id}
                    colSpan={colSpan ? colSpan : header.colSpan}
                    className="text-center"
                    style={{ width: `${header.getSize()}px` }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className=" border">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-center border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
