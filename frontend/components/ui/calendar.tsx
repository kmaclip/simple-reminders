"use client"

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format, isSameDay, isToday } from 'date-fns';

interface CalendarProps {
  date?: Date;
  onSelect?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ date, onSelect }) => {
  const [currentDate, setCurrentDate] = useState(date || new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const generateDays = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const isSelected = date && isCurrentMonth && isSameDay(currentDayDate, date);
      const isTodayDate = isCurrentMonth && isToday(currentDayDate);

      days.push(
        <button
          key={i}
          onClick={() => {
            if (isCurrentMonth && onSelect) {
              onSelect(currentDayDate);
            }
          }}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors",
            isCurrentMonth 
              ? "hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer dark:text-zinc-100" 
              : "text-zinc-300 dark:text-zinc-600 cursor-default",
            isSelected && "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
            isTodayDate && !isSelected && "border-2 border-blue-500 dark:border-blue-400"
          )}
          disabled={!isCurrentMonth}
        >
          {isCurrentMonth ? dayNumber : ''}
        </button>
      );
    }
    return days;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  return (
    <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
      {/* Calendar Header */}
      <div className="p-3 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 dark:text-zinc-100" />
        </button>
        <span className="font-semibold dark:text-zinc-100">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 dark:text-zinc-100" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 p-2 border-b border-zinc-200 dark:border-zinc-700">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-xs font-medium text-zinc-500 dark:text-zinc-400 text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 p-2">
        {generateDays()}
      </div>
    </div>
  );
};

export { Calendar };