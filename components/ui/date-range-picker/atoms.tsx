
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- NavButton ---
interface NavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction: "left" | "right";
}

export const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ direction, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {direction === "left" ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
    );
  }
);
NavButton.displayName = "NavButton";

// --- CalendarDay ---
import { LeaveType, DayPart } from "./types";

const leaveTypeColors: Record<LeaveType, string> = {
  paid: "bg-primary text-primary-foreground hover:bg-primary/90",
  unpaid: "bg-amber-500 text-white hover:bg-amber-600",
  remote: "bg-blue-500 text-white hover:bg-blue-600",
  sickness: "bg-red-500 text-white hover:bg-red-600",
  other: "bg-gray-500 text-white hover:bg-gray-600",
};

const leaveTypeRangeColors: Record<LeaveType, string> = {
  paid: "bg-primary/20 text-primary-foreground",
  unpaid: "bg-amber-100 text-amber-900",
  remote: "bg-blue-100 text-blue-900",
  sickness: "bg-red-100 text-red-900",
  other: "bg-gray-100 text-gray-900",
};


interface CalendarDayProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  date: Date;
  isSelected?: boolean;
  israngeStart?: boolean;
  israngeEnd?: boolean;
  isInRange?: boolean;
  isToday?: boolean;
  isOutsideMonth?: boolean;
  isHalfDayStart?: boolean; 
  isHalfDayEnd?: boolean;
  leaveType?: LeaveType; 
  isWeekend?: boolean;
  onDayClick?: (date: Date, part: DayPart) => void;
}

export const CalendarDay = forwardRef<HTMLButtonElement, CalendarDayProps>(
  (
    {
      date,
      isSelected,
      israngeStart,
      israngeEnd,
      isInRange,
      isToday,
      isOutsideMonth,
      isHalfDayStart,
      isHalfDayEnd,
      leaveType,
      isWeekend,
      className,
      onDayClick,
      ...props
    },
    ref
  ) => {
    const baseSelectionClass = leaveType ? leaveTypeColors[leaveType] : "bg-primary text-primary-foreground hover:bg-primary/90";
    const baseRangeClass = leaveType ? leaveTypeRangeColors[leaveType] : "bg-accent text-accent-foreground";

    // Split interactivity logic
    // We render a main container relative
    // Two absolute divs 50% width each handle the clicks
    
    return (
      <div
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center text-sm font-normal rounded-md overflow-hidden",
          isWeekend && "opacity-30 cursor-not-allowed bg-muted/20",
          !isWeekend && "cursor-pointer",
          // Base Range Loop Styling
          isInRange && !israngeStart && !israngeEnd && !isWeekend && cn(baseRangeClass, "rounded-none"),
          // Start/End Rounding override
          israngeStart && !isWeekend && "rounded-l-md rounded-r-none",
          israngeEnd && !isWeekend && "rounded-r-md rounded-l-none",
          
          isToday && !isSelected && "bg-accent/30 font-semibold",
          isOutsideMonth && "text-muted-foreground opacity-50",
          className
        )}
      >
         {/* Background Visuals for Selection */}
         {/* Full Selection */}
         {/* If it is start/end and NOT half day -> Full color */}
         
         {/* Start Day Visuals */}
         {israngeStart && !isWeekend && (
             <>
                {/* Left Half: If HalfDayStart=true (PM start), then transparent. Else Full Color. */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-1/2 -z-10", 
                    isHalfDayStart ? "bg-transparent" : baseSelectionClass
                )} />
                {/* Right Half: Always Full Color if Start */}
                <div className={cn("absolute right-0 top-0 bottom-0 w-1/2 -z-10", baseSelectionClass)} />
             </>
         )}

         {/* End Day Visuals */}
         {israngeEnd && !isWeekend && (
             <>
                {/* Left Half: Always Full Color if End */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-1/2 -z-10", baseSelectionClass)} />
                {/* Right Half: If HalfDayEnd=true (AM end), then transparent. Else Full Color. */}
                <div className={cn("absolute right-0 top-0 bottom-0 w-1/2 -z-10", 
                    isHalfDayEnd ? "bg-transparent" : baseSelectionClass
                )} />
             </>
         )}
         
         {/* Middle Range Visuals handled by container baseRangeClass */}

         <span className={cn(
             "relative z-20 pointer-events-none",
             (israngeStart || israngeEnd) && !isWeekend && "text-primary-foreground" // Ensure text contrast
         )}>
             {date.getDate()}
         </span>

         {/* Interactive Layers (AM/PM) */}
         {!isWeekend && (
             <>
                 <div 
                    role="button"
                    onClick={(e) => { e.stopPropagation(); onDayClick?.(date, 'am'); }}
                    className="absolute left-0 top-0 bottom-0 w-1/2 z-30 hover:bg-black/10 transition-colors"
                    title="Morning"
                 />
                 <div 
                    role="button"
                    onClick={(e) => { e.stopPropagation(); onDayClick?.(date, 'pm'); }}
                    className="absolute right-0 top-0 bottom-0 w-1/2 z-30 hover:bg-black/10 transition-colors"
                    title="Afternoon"
                 />
             </>
         )}
      </div>
    );
  }
);
CalendarDay.displayName = "CalendarDay";
