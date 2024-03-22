import { ColumnDef } from "@tanstack/react-table";

export const calcPoints = (): number => {
  return 0;
};

export const columns: ColumnDef<Team>[] = [
  {
    size: 500,
    accessorKey: "id",
    enableResizing: false,
    enableHiding: false,
    header(props) {
      return (
        <div className="text-left font-bold text-white text-xl md:text-3xl">{props.table.options.meta?.groupName}</div>
      );
    },
    columns: [
      {
        accessorKey: "group_name",
        header: "",
        size: 30,
        cell(props) {
          return <div className="text-left">{props.row.index + 1}</div>;
        },
      },
      {
        accessorKey: "name",
        header: "",
        size: 300,
        cell(props) {
          return <div className="text-left">{props.cell.getValue() as string}</div>;
        },
      },
    ],
  },
  {
    accessorKey: "rm",
    header: "RM",
    cell({ row }) {
      const sum = row.original.rm;
      return <div>{sum}</div>;
    },
  },
  {
    accessorKey: "w",
    header: "W",
  },
  {
    accessorKey: "r",
    header: "R",
  },
  {
    accessorKey: "p",
    header: "P",
  },
  {
    accessorKey: "points",
    header: "Pkt",
    cell(props) {
      const wins = props.row.original.w;
      const ties = props.row.original.r;

      return <span>{Number(wins * 2 + ties * 1)}</span>;
    },
  },
  {
    accessorKey: "bz",
    header: "BZ",
  },
  {
    accessorKey: "bs",
    header: "BS",
  },
  {
    accessorKey: "bz_bs_sum",
    header: "+/-",
    cell(props) {
      const bz = props.row.original.bz;
      const bs = props.row.original.bs;

      return <span>{Number(bz - bs)}</span>;
    },
  },
];
