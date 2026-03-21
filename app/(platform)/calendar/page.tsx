"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CalendarEvent = {
  id: string;
  title: string;
  dayOffset: number;
  startHour: number;
  durationHours: number;
  color: string;
  textColor: string;
  badgeColor: string;
  tag?: string;
  allDay?: boolean;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 11 }, (_, index) => 8 + index);

const EVENT_STYLES = {
  blue: "border-blue-200/80 bg-blue-50/80 text-blue-950 shadow-sm",
  peach: "border-orange-200/80 bg-orange-50/80 text-orange-950 shadow-sm",
  green: "border-emerald-200/80 bg-emerald-50/80 text-emerald-950 shadow-sm",
  lilac: "border-violet-200/80 bg-violet-50/80 text-violet-950 shadow-sm",
  yellow: "border-amber-200/80 bg-amber-50/80 text-amber-950 shadow-sm",
  slate: "border-slate-200/80 bg-slate-50/90 text-slate-900 shadow-sm",
} as const;

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "event-1",
    title: "Portfolio review",
    dayOffset: 0,
    startHour: 9,
    durationHours: 1.5,
    color: EVENT_STYLES.blue,
    textColor: "text-blue-700",
    badgeColor: "bg-blue-100 text-blue-700",
    tag: "Deep work",
  },
  {
    id: "event-2",
    title: "Application sprint",
    dayOffset: 1,
    startHour: 10,
    durationHours: 2,
    color: EVENT_STYLES.slate,
    textColor: "text-slate-600",
    badgeColor: "bg-slate-100 text-slate-700",
    tag: "Career",
  },
  {
    id: "event-3",
    title: "Interview prep",
    dayOffset: 2,
    startHour: 9.5,
    durationHours: 1.5,
    color: EVENT_STYLES.peach,
    textColor: "text-orange-700",
    badgeColor: "bg-orange-100 text-orange-700",
    tag: "Focus",
  },
  {
    id: "event-4",
    title: "Lunch break",
    dayOffset: 0,
    startHour: 12,
    durationHours: 1,
    color: EVENT_STYLES.green,
    textColor: "text-emerald-700",
    badgeColor: "bg-emerald-100 text-emerald-700",
    tag: "Reset",
  },
  {
    id: "event-5",
    title: "Lunch break",
    dayOffset: 1,
    startHour: 12,
    durationHours: 1,
    color: EVENT_STYLES.green,
    textColor: "text-emerald-700",
    badgeColor: "bg-emerald-100 text-emerald-700",
    tag: "Reset",
  },
  {
    id: "event-6",
    title: "Lunch break",
    dayOffset: 2,
    startHour: 12,
    durationHours: 1,
    color: EVENT_STYLES.green,
    textColor: "text-emerald-700",
    badgeColor: "bg-emerald-100 text-emerald-700",
    tag: "Reset",
  },
  {
    id: "event-7",
    title: "Lunch break",
    dayOffset: 3,
    startHour: 12,
    durationHours: 1,
    color: EVENT_STYLES.green,
    textColor: "text-emerald-700",
    badgeColor: "bg-emerald-100 text-emerald-700",
    tag: "Reset",
  },
  {
    id: "event-8",
    title: "Lunch break",
    dayOffset: 4,
    startHour: 12,
    durationHours: 1,
    color: EVENT_STYLES.green,
    textColor: "text-emerald-700",
    badgeColor: "bg-emerald-100 text-emerald-700",
    tag: "Reset",
  },
  {
    id: "event-9",
    title: "Mock interview",
    dayOffset: 3,
    startHour: 13,
    durationHours: 1,
    color: EVENT_STYLES.lilac,
    textColor: "text-violet-700",
    badgeColor: "bg-violet-100 text-violet-700",
    tag: "Live",
  },
  {
    id: "event-10",
    title: "Networking catch-up",
    dayOffset: 4,
    startHour: 9,
    durationHours: 1.5,
    color: EVENT_STYLES.blue,
    textColor: "text-blue-700",
    badgeColor: "bg-blue-100 text-blue-700",
    tag: "Calls",
  },
  {
    id: "event-11",
    title: "Resume refresh",
    dayOffset: 2,
    startHour: 13,
    durationHours: 2,
    color: EVENT_STYLES.yellow,
    textColor: "text-amber-700",
    badgeColor: "bg-amber-100 text-amber-700",
    tag: "Docs",
  },
  {
    id: "event-12",
    title: "Recruiter follow-ups",
    dayOffset: 4,
    startHour: 14,
    durationHours: 1,
    color: EVENT_STYLES.peach,
    textColor: "text-orange-700",
    badgeColor: "bg-orange-100 text-orange-700",
    tag: "Outreach",
  },
  {
    id: "event-13",
    title: "Application review",
    dayOffset: 1,
    startHour: 14,
    durationHours: 1.5,
    color: EVENT_STYLES.slate,
    textColor: "text-slate-600",
    badgeColor: "bg-slate-100 text-slate-700",
    tag: "Admin",
  },
  {
    id: "event-14",
    title: "Interview prep pack",
    dayOffset: 2,
    startHour: 0,
    durationHours: 0,
    color: EVENT_STYLES.slate,
    textColor: "text-slate-600",
    badgeColor: "bg-slate-100 text-slate-700",
    allDay: true,
    tag: "All day",
  },
];

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function formatHourLabel(hour: number) {
  if (hour === 12) return "12 PM";
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

function formatEventRange(startHour: number, durationHours: number) {
  const start = toTimeLabel(startHour);
  const end = toTimeLabel(startHour + durationHours);
  return `${start} - ${end}`;
}

function toTimeLabel(hourValue: number) {
  const hours = Math.floor(hourValue);
  const minutes = hourValue % 1 === 0.5 ? "30" : "00";
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${normalizedHour}:${minutes} ${suffix}`;
}

function buildMonthGrid(anchorDate: Date) {
  const monthStart = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    1,
  );
  const monthEnd = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth() + 1,
    0,
  );
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const gridEnd = addDays(monthEnd, 6 - monthEnd.getDay());

  const dates: Date[] = [];
  const current = new Date(gridStart);

  while (current <= gridEnd) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function EventCard({
  event,
  compact = false,
}: {
  event: CalendarEvent;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-3 transition-transform duration-200 hover:-translate-y-0.5",
        event.color,
        compact ? "shadow-none" : "",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {event.tag && (
            <p
              className={cn(
                "mb-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                event.textColor,
              )}
            >
              {event.tag}
            </p>
          )}
          <p className="truncate text-sm font-semibold">{event.title}</p>
          {!event.allDay && (
            <p className="mt-1 text-xs text-slate-500">
              {formatEventRange(event.startHour, event.durationHours)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekAnchor, setWeekAnchor] = useState(startOfWeek(today));

  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekAnchor, index));
  const monthGrid = buildMonthGrid(selectedDate);

  const allDayEvents = MOCK_EVENTS.filter((event) => event.allDay);
  const timedEvents = MOCK_EVENTS.filter((event) => !event.allDay);
  const todayIndex = today.getDay() === 0 ? -1 : today.getDay() - 1;

  const todaysEvents = timedEvents
    .filter((event) => event.dayOffset === todayIndex)
    .sort((first, second) => first.startHour - second.startHour);

  const handlePreviousWeek = () => {
    const nextAnchor = addDays(weekAnchor, -7);
    setWeekAnchor(nextAnchor);
    setSelectedDate(nextAnchor);
  };

  const handleNextWeek = () => {
    const nextAnchor = addDays(weekAnchor, 7);
    setWeekAnchor(nextAnchor);
    setSelectedDate(nextAnchor);
  };

  const jumpToToday = () => {
    const nextAnchor = startOfWeek(today);
    setWeekAnchor(nextAnchor);
    setSelectedDate(today);
  };

  return (
    // 1. Lock the screen height and set up a flex column
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      
      <header className="shrink-0 flex items-center gap-3 border-b border-border bg-card px-5 py-3">
        <span className="ml-3 text-2xl font-serif tracking-wider">Calendar</span>
      </header>


      <div className="flex-1 min-h-0 grid grid-cols-1 gap-5 p-6 xl:grid-cols-[minmax(0,1fr)_320px]">

        <section className="flex flex-col min-h-0 overflow-hidden rounded-md border border-border bg-card shadow-sm">

          <header className="shrink-0 flex flex-col gap-4 border-b border-border px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                Weekly Planner
              </p>
              <h1 className="mt-2 font-serif text-3xl tracking-wide">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={jumpToToday}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Today
              </button>
              <div className="flex items-center rounded-md border border-border bg-background p-1">
                <button
                  onClick={handlePreviousWeek}
                  className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextWeek}
                  className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <button className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800">
                <Plus className="h-4 w-4" />
                New event
              </button>
            </div>
          </header>


          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <div className="grid min-h-[760px] min-w-[780px] grid-cols-[72px_repeat(7,minmax(140px,1fr))]">
            <div className="border-r border-border bg-muted/20" />

            {weekDays.map((day) => {
              const isCurrentDay = isSameDay(day, today);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "border-r border-border px-3 py-4 text-center last:border-r-0",
                    isCurrentDay ? "bg-orange-50/60" : "bg-card",
                  )}
                >
                  <div
                    className={cn(
                      "mx-auto flex h-11 w-11 items-center justify-center rounded-md text-lg font-semibold",
                      isCurrentDay ? "bg-orange-500 text-white" : "bg-muted text-foreground",
                    )}
                  >
                    {day.getDate()}
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                </div>
              );
            })}

            <div className="border-r border-t border-border bg-muted/20 px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              All Day
            </div>
            {weekDays.map((day, dayIndex) => (
              <div
                key={`all-day-${day.toISOString()}`}
                className="border-r border-t border-border px-3 py-3 last:border-r-0"
              >
                {allDayEvents
                  .filter((event) => event.dayOffset === dayIndex)
                  .map((event) => (
                    <EventCard key={event.id} event={event} compact />
                  ))}
              </div>
            ))}

            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div className="border-r border-t border-border bg-muted/20 px-4 py-6 text-right text-xs font-medium text-muted-foreground">
                  {formatHourLabel(hour)}
                </div>

                {weekDays.map((day, dayIndex) => {
                  const events = timedEvents.filter(
                    (event) => event.dayOffset === dayIndex && Math.floor(event.startHour) === hour,
                  );

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={cn(
                        "min-h-[108px] border-r border-t border-border p-3 last:border-r-0",
                        isSameDay(day, today) ? "bg-orange-50/20" : "bg-transparent",
                      )}
                    >
                      <div className="flex flex-col gap-3">
                        {events.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            </div>
          </div>
        </section>


        <aside className="flex flex-col gap-4 overflow-y-auto min-h-0 pb-2 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <section className="shrink-0 rounded-md border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Mini Calendar
                </p>
                <h2 className="mt-2 font-serif text-xl">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
              </div>
              <button className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {WEEKDAY_LABELS.map((day) => (
                <span key={day}>{day.slice(0, 2)}</span>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2">
              {monthGrid.map((day) => {
                const inSelectedMonth = day.getMonth() === selectedDate.getMonth();
                const isToday = isSameDay(day, today);
                const isActive = isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => {
                      setSelectedDate(day);
                      setWeekAnchor(startOfWeek(day));
                    }}
                    className={cn(
                      "flex h-10 items-center justify-center rounded-md text-sm transition-all duration-200",
                      inSelectedMonth ? "text-foreground" : "text-muted-foreground/50",
                      isActive ? "bg-black text-white" : "hover:bg-muted",
                      isToday && !isActive ? "border border-orange-200 bg-orange-50 text-orange-600" : "",
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="shrink-0 rounded-md border border-border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Today&apos;s Schedule
                </p>
                <h2 className="mt-2 font-serif text-xl">
                  {today.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
              </div>
              <div className="rounded-md bg-muted px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Planned</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{todaysEvents.length}</p>
              </div>
            </div>

            <div className="space-y-3">
              {todaysEvents.length > 0 ? (
                todaysEvents.map((event) => (
                  <div
                    key={`today-${event.id}`}
                    className="rounded-md border border-border bg-background p-4 transition-colors duration-200 hover:bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{event.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatEventRange(event.startHour, event.durationHours)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                          event.badgeColor,
                        )}
                      >
                        {event.tag ?? "Planned"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-dashed border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
                  No events scheduled for today.
                </div>
              )}
            </div>

            <div className="mt-5 rounded-md bg-muted/60 p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground">
                <Clock3 className="h-4 w-4 text-orange-500" />
                Focus window
              </div>
              <p className="mt-2">
                Block 90 minutes after your highest-priority event to finish follow-ups while context is still fresh.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}