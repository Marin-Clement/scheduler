import { ButtonHTMLAttributes, HTMLAttributes, forwardRef } from "react"
import { cn } from "@/utils/cn"
import { ChevronLeft, ChevronRight } from "lucide-react"

// --- NavButton ---
interface NavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    direction: "left" | "right"
}

export const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
    ({ direction, className, ...props }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    className,
                )}
                {...props}
            >
                {direction === "left" ? (
                    <ChevronLeft className="h-4 w-4" />
                ) : (
                    <ChevronRight className="h-4 w-4" />
                )}
            </button>
        )
    },
)
NavButton.displayName = "NavButton"

// --- CalendarDay ---
import { LeaveType, DayPart } from "./types"

const leaveTypeColors: Record<LeaveType, string> = {
    paid: "bg-primary text-primary-foreground hover:bg-primary/90",
    unpaid: "bg-amber-500 text-white hover:bg-amber-600",
    remote: "bg-blue-500 text-white hover:bg-blue-600",
    sickness: "bg-red-500 text-white hover:bg-red-600",
    other: "bg-gray-500 text-white hover:bg-gray-600",
}

const leaveTypeRangeColors: Record<LeaveType, string> = {
    paid: "bg-primary/30 text-primary-foreground",
    unpaid: "bg-amber-200 text-amber-950",
    remote: "bg-blue-200 text-blue-950",
    sickness: "bg-red-200 text-red-950",
    other: "bg-gray-200 text-gray-950",
}

interface CalendarDayProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "onClick"
> {
    date: Date
    selectedAm?: boolean
    selectedPm?: boolean
    bookedAm?: boolean
    bookedPm?: boolean
    isInRange?: boolean
    isToday?: boolean
    isOutsideMonth?: boolean
    bookedType?: LeaveType
    isWeekend?: boolean
    isAmBlocked?: boolean
    isPmBlocked?: boolean
    onDayClick?: (date: Date, part: DayPart) => void
}

export const CalendarDay = forwardRef<HTMLDivElement, CalendarDayProps>(
    (
        {
            date,
            selectedAm,
            selectedPm,
            bookedAm,
            bookedPm,
            isInRange,
            isToday,
            isOutsideMonth,
            bookedType,
            isWeekend,
            isAmBlocked,
            isPmBlocked,
            className,
            onDayClick,
            ...divProps
        },
        ref,
    ) => {
        const bookedHalfClass = bookedType
            ? leaveTypeColors[bookedType]
            : "bg-gray-500 text-white"
        const selectedHalfClass = "bg-primary text-primary-foreground"
        const rangeClass = bookedType
            ? leaveTypeRangeColors[bookedType]
            : "bg-primary/15"

        const hasColoredHalf = Boolean(
            bookedAm || bookedPm || selectedAm || selectedPm,
        )
        const hasBothColoredHalves = Boolean(
            (bookedAm || selectedAm) && (bookedPm || selectedPm),
        )

        return (
            <div
                ref={ref}
                className={cn(
                    "relative inline-flex h-9 w-9 items-center justify-center text-sm font-normal rounded-md overflow-hidden transition-colors",
                    isWeekend && "opacity-30 cursor-not-allowed bg-muted/20",
                    !isWeekend && "cursor-pointer",
                    isInRange && !isWeekend && rangeClass,
                    isToday && !hasColoredHalf && "bg-accent/30 font-semibold",
                    isOutsideMonth && "text-muted-foreground opacity-50",
                    className,
                )}
                {...divProps}
            >
                {(bookedAm || selectedAm) && !isWeekend && (
                    <div
                        className={cn(
                            "absolute left-0 top-0 bottom-0 w-1/2 z-10",
                            bookedAm ? bookedHalfClass : selectedHalfClass,
                        )}
                    />
                )}
                {(bookedPm || selectedPm) && !isWeekend && (
                    <div
                        className={cn(
                            "absolute right-0 top-0 bottom-0 w-1/2 z-10",
                            bookedPm ? bookedHalfClass : selectedHalfClass,
                        )}
                    />
                )}

                <span
                    className={cn(
                        "relative z-20 pointer-events-none",
                        hasBothColoredHalves &&
                            !isWeekend &&
                            "text-primary-foreground",
                        hasColoredHalf &&
                            !hasBothColoredHalves &&
                            "font-medium",
                    )}
                >
                    {date.getDate()}
                </span>

                {!isWeekend && (
                    <>
                        <div
                            role="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                if (!isAmBlocked) {
                                    onDayClick?.(date, "am")
                                }
                            }}
                            className={cn(
                                "absolute left-0 top-0 bottom-0 w-1/2 z-30 transition-colors",
                                isAmBlocked
                                    ? "cursor-not-allowed"
                                    : "cursor-pointer hover:bg-primary/20",
                            )}
                            title="Morning"
                        />
                        <div
                            role="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                if (!isPmBlocked) {
                                    onDayClick?.(date, "pm")
                                }
                            }}
                            className={cn(
                                "absolute right-0 top-0 bottom-0 w-1/2 z-30 transition-colors",
                                isPmBlocked
                                    ? "cursor-not-allowed"
                                    : "cursor-pointer hover:bg-primary/20",
                            )}
                            title="Afternoon"
                        />
                    </>
                )}
            </div>
        )
    },
)
CalendarDay.displayName = "CalendarDay"
