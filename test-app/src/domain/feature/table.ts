import type { Table } from "@feature/table";
import { signal } from "tilia";

export function makeTable(data: string[][]): Table {
  const headers = data[0].map((name) => ({
    name,
    title: name,
    sortable: true,
  }));
  const [rows, setRows] = signal(data.slice(1));

  return {
    headers,
    rows,
    sort(column: string) {
      const sortIdx = headers.findIndex((h) => h.name === column);
      if (sortIdx === -1) {
        throw new Error(`Column ${column} not found`);
      }
      const list = [...rows.value];
      list.sort((a, b) => a[sortIdx].localeCompare(b[sortIdx]));
      setRows(list);
    },
  };
}
