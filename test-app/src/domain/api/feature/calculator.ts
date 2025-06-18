import type { Signal } from "tilia";

export interface Calculator {
  title: string;
  result: Signal<number>;
  add: (a: number, b: number) => void;
  subtract: (a: number, b: number) => void;
  multiply: (a: number, b: number) => void;
  divide: (a: number, b: number) => void;
}
