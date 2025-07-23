export interface Header {
  readonly name: string;
  readonly title: string;
  readonly sortable: boolean;
}

export type Row = string[];

export interface Table {
  readonly headers: Header[];
  readonly rows: Row[];
  sort(column: string): void;
}
