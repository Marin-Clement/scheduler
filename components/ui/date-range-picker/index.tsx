"use client";

import * as React from "react";
import {
  addMonths,
  format,
  subMonths,
  isBefore,
  startOfToday,
  isValid,
  isSameDay
} from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, X, Check, Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import { MonthHeader, DayGrid } from "./molecules";
import { DateRange, LeaveRequestItem, LeaveType } from "./types";
import { LeaveRequestComposer } from "./composer";

import {
  Select,
} from "@/components/ui/select";

export { LeaveRequestComposer };
export type { DateRange, LeaveRequestItem, LeaveType };
// Assuming we have a Select component, or I should build a simple one/use native if needed.
// The user has `components/ui/select.tsx`, so I can use it!

interface DateRangePickerProps {
  className?: string;
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
  placeholder = "Dates",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [month, setMonth] = React.useState(startOfToday());
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (isOpen && date?.from && isValid(date.from)) {
      setMonth(date.from);
    }
  }, [isOpen]);

  const handleDaySelect = (day: Date) => {
    // Reset if complete range exists or no start date
    if ((date?.from && date?.to) || !date?.from) {
      onDateChange?.({ from: day, to: undefined, fromHalfDay: false, toHalfDay: false });
      return;
    }

    // Complete range
    if (date.from && !date.to) {
      if (isSameDay(day, date.from)) {
          // Clicked same day -> Single day range? Or just deselect?
          // Let's assume single day range is valid (morning to afternoon?)
          // For now, let's just complete as single day range
           onDateChange?.({ from: day, to: day, fromHalfDay: false, toHalfDay: false });
      } else if (isBefore(day, date.from)) {
        onDateChange?.({ from: day, to: date.from, fromHalfDay: false, toHalfDay: false });
      } else {
        onDateChange?.({ from: date.from, to: day, fromHalfDay: false, toHalfDay: false });
      }
    }
  };

  const handleNextMonth = () => setMonth(addMonths(month, 1));
  const handlePrevMonth = () => setMonth(subMonths(month, 1));

  // Toggle Half Days
  const toggleFromHalfDay = (value: string) => {
     if (!date) return;
     onDateChange?.({ ...date, fromHalfDay: value === "pm" });
  }

  const toggleToHalfDay = (value: string) => {
     if (!date) return;
     onDateChange?.({ ...date, toHalfDay: value === "am" });
  }


  // Click outside listener
  const containerRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current?.contains(event.target as Node) ||
        popoverRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Format Display
  const formattedDate = React.useMemo(() => {
    if (!date?.from) return "";
    if (date.from && !isValid(date.from)) return "";
    
    // Format logic with half days
    const fromStr = format(date.from, "d MMM", { locale: fr });
    const fromSuffix = date.fromHalfDay ? " (PM)" : "";
    
    if (!date.to) return `${fromStr}${fromSuffix}`;
    if (date.to && !isValid(date.to)) return `${fromStr}${fromSuffix}`;

    const toStr = format(date.to, "d MMM", { locale: fr });
    const toSuffix = date.toHalfDay ? " (AM)" : "";

    return `${fromStr}${fromSuffix} - ${toStr}${toSuffix}`;
  }, [date]);

  return (
    <div className={cn("relative grid gap-2", className)} ref={containerRef}>
      <div
        className={cn(
          "flex h-9 w-full min-w-[200px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent/50 cursor-pointer",
          isOpen && "ring-2 ring-ring ring-offset-2",
          !formattedDate && "text-muted-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-2 overflow-hidden">
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">{formattedDate || placeholder}</span>
        </div>
        {formattedDate ? (
           <div 
              role="button"
              className="ml-2 rounded-full p-0.5 hover:bg-accent-foreground/10"
              onClick={(e) => {
                  e.stopPropagation();
                  onDateChange?.(undefined);
              }}
           >
               <X className="h-3 w-3 opacity-50" />
           </div>
        ) : null}
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute top-offset-2 mt-1 z-50 w-auto rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
          style={{ top: "100%" }}
        >
          <div className="flex flex-col sm:flex-row border-b">
            {/* Left Calendar */}
            <div className="p-3 w-[280px]">
              <MonthHeader
                currentMonth={month}
                onPrev={handlePrevMonth}
                hideNext
                onNext={() => {}} 
                className="mb-4"
              />
              <DayGrid
                currentMonth={month}
                selectedRange={date || {}}
                onSelect={handleDaySelect}
                hoverDate={hoverDate}
                onHover={setHoverDate}
              />
            </div>

            {/* Right Calendar */}
            <div className="hidden sm:block border-l p-3 w-[280px]">
              <MonthHeader
                currentMonth={addMonths(month, 1)}
                onNext={handleNextMonth}
                hidePrev
                onPrev={() => {}}
                className="mb-4"
              />
              <DayGrid
                currentMonth={addMonths(month, 1)}
                selectedRange={date || {}}
                onSelect={handleDaySelect}
                hoverDate={hoverDate}
                onHover={setHoverDate}
              />
            </div>
          </div>
          
          {/* Footer Controls for Half Days */}
          {(date?.from && date?.to) && (
             <div className="p-3 bg-muted/30 flex items-center justify-between gap-4 text-sm">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Début</span>
                    <Select 
                        value={date.fromHalfDay ? "pm" : "am"} 
                        onChange={(e) => toggleFromHalfDay(e.target.value)}
                        className="h-8 w-[130px] text-xs"
                    >
                        <option value="am">Matin (09:00)</option>
                        <option value="pm">Après-midi (14:00)</option>
                    </Select>
                </div>
                
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Fin</span>
                    <Select 
                        value={date.toHalfDay ? "am" : "pm"} 
                        onChange={(e) => toggleToHalfDay(e.target.value)}
                        className="h-8 w-[130px] text-xs"
                    >
                        <option value="am">Matin (12:00)</option>
                        <option value="pm">Après-midi (18:00)</option>
                    </Select>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
