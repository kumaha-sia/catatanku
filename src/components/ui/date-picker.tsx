"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { id } from "date-fns/locale";

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 transition-colors hover:border-outline-variant"
      >
        <span className="material-symbols-outlined mr-2 text-primary-container">
          calendar_today
        </span>
        <span
          className={`flex-grow text-left text-base ${value ? "text-on-surface" : "text-on-surface-variant/60"}`}
        >
          {value ? format(value, "d MMMM yyyy", { locale: id }) : placeholder}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="ml-2 text-on-surface-variant/40 hover:text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[320px] rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-lg">
          {/* Month Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="font-headline-md text-base font-semibold capitalize text-on-surface">
              {format(currentMonth, "MMMM yyyy", { locale: id })}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekdays.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              const inMonth = isSameMonth(d, currentMonth);
              const selected = value && isSameDay(d, value);
              const today = isToday(d);

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(d);
                    setOpen(false);
                  }}
                  className={`relative flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    selected
                      ? "bg-primary-container text-on-primary shadow-sm"
                      : today
                        ? "bg-primary-container/10 font-bold text-primary-container"
                        : inMonth
                          ? "text-on-surface hover:bg-surface-container"
                          : "text-on-surface-variant/30"
                  }`}
                >
                  {format(d, "d")}
                  {today && !selected && (
                    <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary-container" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex items-center justify-between border-t border-outline-variant/20 pt-3">
            <button
              type="button"
              onClick={() => {
                onChange(new Date());
                setOpen(false);
              }}
              className="text-xs font-semibold text-primary-container hover:underline"
            >
              Hari ini
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="text-xs font-semibold text-on-surface-variant hover:underline"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
