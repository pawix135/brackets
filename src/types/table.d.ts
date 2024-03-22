import "@tanstack/react-table"; //or vue, svelte, solid, etc.

declare module "@tanstack/react-table" {
  interface TableMeta {
    groupName: string;
    isEditing: boolean;
    updateData: (teamIndex: number, key: keyof Team) => void;
    oneUp: (teamIndex: number, key: keyof TeamNumbers) => void;
    changeByOne: (teamIndex: number, key: keyof TeamNumbers, by: "up" | "down") => void;
  }
  interface ColumnMeta {
    colSpan: number;
  }
}
