export function toRecords(table: string[][]): Record<string, string>[] {
  if (table.length < 2) {
    return [];
  }
  const headers = table[0];
  const rows = table.slice(1);

  return rows.map((row) => {
    return row.reduce(
      (acc, cell, index) => {
        acc[headers[index]] = cell;
        return acc;
      },
      {} as Record<string, string>,
    );
  });
}

export function toStrings(table: string[][]): string[] {
  if (table.length < 2) {
    return [];
  }
  const rows = table.slice(1);

  return rows.map((row) => row[0]);
}

export function toNumbers(table: string[][]): number[] {
  if (table.length < 2) {
    return [];
  }
  const rows = table.slice(1);

  return rows.map((row) => Number(row[0]));
}
