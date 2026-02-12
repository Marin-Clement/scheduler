import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isWithinInterval,
  isBefore,
  isAfter,
} from "date-fns";
import { fr } from "date-fns/locale"; // Assuming French locale based on user location/context
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarDay, NavButton } from "./atoms";
import { cn } from "@/utils/cn";

// --- MonthHeader ---
interface MonthHeaderProps {
  currentMonth: Date;
  onNext?: () => void;
  onPrev?: () => void;
  hideNext?: boolean;
  hidePrev?: boolean;
  className?: string;
}

export const MonthHeader = ({
  currentMonth,
  onNext,
  onPrev,
  hideNext,
  hidePrev,
  className,
}: MonthHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between px-2 pt-1", className)}>
      <div className="text-sm font-semibold capitalize">
        {format(currentMonth, "MMMM yyyy", { locale: fr })}
      </div>
      <div className="flex items-center space-x-1">
        {!hidePrev && onPrev && <NavButton direction="left" onClick={onPrev} />}
        {!hideNext && onNext && <NavButton direction="right" onClick={onNext} />}
      </div>
    </div>
  );
};

// ... imports
import { LeaveRequestItem, DayPart } from "./types";

interface DayGridProps {
  currentMonth: Date;
  selectedRange: { from?: Date; to?: Date; fromHalfDay?: boolean; toHalfDay?: boolean };
  bookedRanges?: LeaveRequestItem[];
  excludeWeekends?: boolean;
  onSelect: (date: Date, part: DayPart) => void;
  hoverDate: Date | null;
  onHover: (date: Date | null) => void;
}

export const DayGrid = ({
  currentMonth,
  selectedRange,
  bookedRanges = [],
  excludeWeekends = true,
  onSelect,
  hoverDate,
  onHover,
}: DayGridProps) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: fr });
  const endDate = endOfWeek(monthEnd, { locale: fr });

  const daysInMonth = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Weekday Headers
  const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1 text-center text-[0.8rem] text-muted-foreground">
        {weekdays.map((day) => (
          <div key={day} aria-label={day}>
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-2">
        {daysInMonth.map((dayDate, i) => {
          const isWeekendDay = excludeWeekends && checkIsWeekend(dayDate);

          // Check for Booked Ranges
          let isBooked = false;
          let bookedType = undefined;
          let isBookedStart = false;
          let isBookedEnd = false;
          let isBookedHalfStart = false;
          let isBookedHalfEnd = false;

          for (const item of bookedRanges) {
            if (item.range.from && item.range.to) {
               const isIn = isWithinInterval(dayDate, { start: item.range.from, end: item.range.to });
               if (isIn) {
                 isBooked = true;
                 bookedType = item.type;
                 isBookedStart = isSameDay(dayDate, item.range.from);
                 isBookedEnd = isSameDay(dayDate, item.range.to);
                 if (isBookedStart) isBookedHalfStart = !!item.range.fromHalfDay;
                 if (isBookedEnd) isBookedHalfEnd = !!item.range.toHalfDay;
                 break; 
               }
            } else if (item.range.from && isSameDay(dayDate, item.range.from)) {
                 isBooked = true;
                 bookedType = item.type;
                 isBookedStart = true;
                 isBookedEnd = true; 
                 break;
            }
          }

          const isSelectedStart =
            !isBooked && selectedRange.from && isSameDay(dayDate, selectedRange.from);
          const isSelectedEnd =
            !isBooked && selectedRange.to && isSameDay(dayDate, selectedRange.to);
          const isSelected = isSelectedStart || isSelectedEnd;

          let isInRange =
            !isBooked &&
            selectedRange.from &&
            selectedRange.to &&
            isWithinInterval(dayDate, {
              start: selectedRange.from,
              end: selectedRange.to,
            });

          if (!isBooked && !isInRange && selectedRange.from && !selectedRange.to && hoverDate) {
            const start = selectedRange.from;
            const end = hoverDate;
            if (isBefore(start, end)) {
               isInRange = isWithinInterval(dayDate, { start, end });
            } else {
               isInRange = isWithinInterval(dayDate, { start: end, end: start });
            }
          }

          const dayProps = isBooked
            ? {
                isSelected: true,
                israngeStart: isBookedStart,
                israngeEnd: isBookedEnd,
                isInRange: true,
                leaveType: bookedType,
                isHalfDayStart: isBookedHalfStart,
                isHalfDayEnd: isBookedHalfEnd,
              }
            : {
                isSelected,
                israngeStart: isSelectedStart,
                israngeEnd: isSelectedEnd,
                isInRange,
                isHalfDayStart: isSelectedStart ? selectedRange.fromHalfDay : false,
                isHalfDayEnd: isSelectedEnd ? selectedRange.toHalfDay : false,
              };

          return (
            <CalendarDay
              key={dayDate.toString()}
              date={dayDate}
              isToday={isToday(dayDate)}
              isOutsideMonth={!isSameMonth(dayDate, monthStart)}
              isWeekend={isWeekendDay}
              {...dayProps}
              onDayClick={(d, part) => !isWeekendDay && onSelect(d, part)}
              onMouseEnter={() => !isWeekendDay && onHover(dayDate)}
              onMouseLeave={() => !isWeekendDay && onHover(null)}
              className={cn(
                  (dayProps.israngeStart) && "rounded-l-md rounded-r-none",
                  (dayProps.israngeEnd) && "rounded-r-md rounded-l-none",
                  (dayProps.isInRange) && !(dayProps.israngeStart) && !(dayProps.israngeEnd) && "rounded-none"
              )}
            />
          );
        })}
      </div>
    </div>
  );
};
