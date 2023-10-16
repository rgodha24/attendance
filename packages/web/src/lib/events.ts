import { createNanoEvents } from "nanoevents";

type Events = {
  signin: [
    {
      studentID: number;
      scannerName: string;
      time: Date;
    }
  ];
};

type ToFunction<T extends Record<string, any[]>> = {
  [K in keyof T]: (...args: T[K]) => void;
};

export const emitter = createNanoEvents<ToFunction<Events>>();
