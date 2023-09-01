import { toast } from "@/components/ui/use-toast";
import { setHours, setMinutes } from "date-fns";
import { create } from "zustand";

type Values = {
  start: Date;
  end: Date;
};

type Functions = {
  setStart: (date: Date | ((d: Date) => Date)) => void;
  setEnd: (date: Date | ((d: Date) => Date)) => void;
};

export const datesStore = create<Values & Functions>((set) => ({
  start: new Date(),
  end: setHours(new Date(), new Date().getHours() + 1),
  setStart: (_date) => {
    set(({ start, end }) => {
      let date: Date;
      if (typeof _date === "function") date = _date(start);
      else date = _date;

      if (date.getTime() >= end.getTime()) {
        toast({
          variant: "destructive",
          title:
            "Start time must be before end time. Setting start time to 1 minute before end time",
        });
        return { start: setMinutes(date, end.getMinutes() - 1) };
      } else return { start: date };
    });
  },
  setEnd: (_date) => {
    set(({ start, end }) => {
      let date: Date;
      if (typeof _date === "function") date = _date(end);
      else date = _date;

      if (date.getTime() <= start.getTime()) {
        console.log("end < start");
        return { end: setMinutes(date, start.getMinutes() + 1) };
      } else return { end: date };
    });
  },
}));