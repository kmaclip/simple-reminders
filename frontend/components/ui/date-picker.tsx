"use client"

import * as React from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date) => void
}

export function DatePicker({ date, onSelect }: DatePickerProps) {
  const [selected, setSelected] = React.useState<Date | undefined>(date)

  const handleSelect = (date: Date) => {
    setSelected(date)
    if (onSelect) {
      onSelect(date)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            "dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100",
            "dark:hover:bg-zinc-700",
            !selected && "text-muted-foreground dark:text-zinc-400"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 dark:bg-zinc-800 dark:border-zinc-700" 
        align="start"
      >
        <Calendar
          date={selected}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}