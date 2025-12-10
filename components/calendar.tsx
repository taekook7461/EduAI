"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  markedDates?: Date[];
}

export function Calendar({ selectedDate, onDateSelect, markedDates = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate);

  useEffect(() => {
    setCurrentDate(selectedDate);
  }, [selectedDate]);

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay() || 7;

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const emptyDays = Array.from({ length: firstDay - 1 }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isMarked = (day: number) => {
    return markedDates.some((d) => d.toDateString() ===
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
    );
  };

  const isSelected = (day: number) => {
    return selectedDate.toDateString() ===
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.toDateString() ===
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
  };

  const selectDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect(date);
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold capitalize">
          {currentDate.toLocaleString("ru-RU", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* days of week */}
      <div className="grid grid-cols-7 gap-2 text-center font-medium text-sm text-gray-600">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
          <div key={d}>{d}</div>
        ))}

        {/* empty boxes before 1st day */}
        {emptyDays.map((_, i) => (
          <div key={i} />
        ))}

        {/* days */}
        {days.map((day) => {
          const marked = isMarked(day);
          const selected = isSelected(day);
          const today = isToday(day);

          return (
            <div
              key={day}
              onClick={() => selectDate(day)}
              className={`relative aspect-square flex items-center justify-center cursor-pointer rounded-lg
                border border-gray-200
                hover:bg-blue-50 
                ${selected ? "bg-blue-600 text-white font-bold" : ""}
                ${today && !selected ? "bg-blue-100 border-blue-400" : ""}
              `}
            >
              {day}

              {marked && (
                <div className="absolute bottom-1 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
