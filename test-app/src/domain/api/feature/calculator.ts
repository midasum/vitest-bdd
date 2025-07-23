export interface Calculator {
  readonly title: string;
  readonly result: number;
  add: (a: number, b: number) => void;
  subtract: (a: number, b: number) => void;
  multiply: (a: number, b: number) => void;
  divide: (a: number, b: number) => void;
}
