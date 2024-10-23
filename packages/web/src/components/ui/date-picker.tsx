import { format, setHours, setMinutes } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";

export function DateTimePicker({
  date,
  setDate,
}: {
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "min-w-[200px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 w-4 h-4" />
          {date ? format(date, "L/d/yy h:mm a") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col p-2 space-y-2 w-auto">
        <div className="rounded-md border">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newdate) => {
              if (newdate)
                setDate(
                  new Date(
                    newdate.getFullYear(),
                    newdate.getMonth(),
                    newdate.getDate(),
                    date.getHours(),
                    date.getMinutes(),
                  ),
                );
            }}
          />
        </div>
        <div className="flex flex-row gap-x-4 justify-between rounded-md border">
          <Input
            type="time"
            onChange={(event) => {
              const date = event.target.valueAsDate;

              if (date) {
                setDate((d) =>
                  setMinutes(
                    setHours(d, date.getUTCHours()),
                    date.getUTCMinutes(),
                  ),
                );
              }
            }}
            value={format(date, "HH:mm")}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
