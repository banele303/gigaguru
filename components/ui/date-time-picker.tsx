"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  id?: string;
  name?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  required?: boolean;
  className?: string;
}

export function DateTimePicker({
  id,
  name,
  value,
  onChange,
  required,
  className,
}: DateTimePickerProps) {
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    const currentHours = value?.getHours() ?? 0;
    const currentMinutes = value?.getMinutes() ?? 0;

    const newDate = new Date(selectedDate);
    newDate.setHours(currentHours, currentMinutes);

    onChange?.(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (!timeValue || !value) return;

    const [hours, minutes] = timeValue.split(":").map(Number);
    const newDate = new Date(value);
    newDate.setHours(hours, minutes);

    onChange?.(newDate);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={value ? format(value, "HH:mm") : ""}
        onChange={handleTimeChange}
        disabled={!value}
        className="w-full"
      />
      <input
        type="hidden"
        id={id}
        name={name}
        value={value?.toISOString() ?? ""}
        required={required}
      />
    </div>
  );
}