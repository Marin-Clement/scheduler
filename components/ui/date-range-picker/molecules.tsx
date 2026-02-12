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
    isWeekend,
    isAfter,
} from "date-fns"
import { fr } from "date-fns/locale" // Assuming French locale based on user location/context
import { CalendarDay, NavButton } from "./atoms"
import { cn } from "@/utils/cn"

// --- MonthHeader ---
interface MonthHeaderProps {
    currentMonth: Date
    onNext?: () => void
    onPrev?: () => void
    hideNext?: boolean
    hidePrev?: boolean
    className?: string
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
        <div
            className={cn(
                "flex items-center justify-between px-2 pt-1",
                className,
            )}
        >
            <div className="text-sm font-semibold capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: fr })}
            </div>
            <div className="flex items-center space-x-1">
                {!hidePrev && onPrev && (
                    <NavButton direction="left" onClick={onPrev} />
                )}
                {!hideNext && onNext && (
                    <NavButton direction="right" onClick={onNext} />
                )}
            </div>
        </div>
    )
}

// ... imports
import { LeaveRequestItem, DayPart } from "./types"

interface DayGridProps {
    currentMonth: Date
    selectedRange: {
        from?: Date
        to?: Date
        fromHalfDay?: boolean
        toHalfDay?: boolean
    }
    bookedRanges?: LeaveRequestItem[]
    excludeWeekends?: boolean
    onSelect: (date: Date, part: DayPart) => void
    hoverDate: Date | null
    onHover: (date: Date | null) => void
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
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { locale: fr })
    const endDate = endOfWeek(monthEnd, { locale: fr })

    const daysInMonth = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const getRangeHalfOccupancy = (
        range: {
            from?: Date
            to?: Date
            fromHalfDay?: boolean
            toHalfDay?: boolean
        },
        dayDate: Date,
    ) => {
        if (!range.from) {
            return { am: false, pm: false, inRange: false }
        }

        const rangeEnd = range.to || range.from
        const inRange = isWithinInterval(dayDate, {
            start: range.from,
            end: rangeEnd,
        })

        if (!inRange) {
            return { am: false, pm: false, inRange: false }
        }

        const isStart = isSameDay(dayDate, range.from)
        const isEnd = isSameDay(dayDate, rangeEnd)

        if (isStart && isEnd) {
            if (!range.to) {
                if (range.fromHalfDay) {
                    return { am: false, pm: true, inRange: false }
                }
                if (range.toHalfDay) {
                    return { am: true, pm: false, inRange: false }
                }
            }
            return {
                am: !range.fromHalfDay,
                pm: !range.toHalfDay,
                inRange: false,
            }
        }

        if (isStart) {
            return {
                am: !range.fromHalfDay,
                pm: true,
                inRange: false,
            }
        }

        if (isEnd) {
            return {
                am: true,
                pm: !range.toHalfDay,
                inRange: false,
            }
        }

        return { am: true, pm: true, inRange: true }
    }

    // Weekday Headers
    const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

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
                {daysInMonth.map((dayDate) => {
                    const isWeekendDay = excludeWeekends && isWeekend(dayDate)

                    let bookedAm = false
                    let bookedPm = false
                    let bookedType: LeaveRequestItem["type"] | undefined =
                        undefined

                    for (const item of bookedRanges) {
                        const occupancy = getRangeHalfOccupancy(
                            item.range,
                            dayDate,
                        )
                        if (occupancy.am || occupancy.pm) {
                            bookedType = item.type
                            bookedAm = bookedAm || occupancy.am
                            bookedPm = bookedPm || occupancy.pm
                        }
                    }

                    const selectedOccupancy = getRangeHalfOccupancy(
                        selectedRange,
                        dayDate,
                    )

                    let isInRange = selectedOccupancy.inRange

                    if (
                        !isInRange &&
                        selectedRange.from &&
                        !selectedRange.to &&
                        hoverDate
                    ) {
                        const start = selectedRange.from
                        const end = hoverDate
                        if (!isSameDay(dayDate, start)) {
                            const rangeStart = isBefore(start, end)
                                ? start
                                : end
                            const rangeEnd = isAfter(start, end) ? start : end
                            isInRange = isWithinInterval(dayDate, {
                                start: rangeStart,
                                end: rangeEnd,
                            })
                        }
                    }

                    return (
                        <CalendarDay
                            key={dayDate.toString()}
                            date={dayDate}
                            isToday={isToday(dayDate)}
                            isOutsideMonth={!isSameMonth(dayDate, monthStart)}
                            isWeekend={isWeekendDay}
                            selectedAm={selectedOccupancy.am && !bookedAm}
                            selectedPm={selectedOccupancy.pm && !bookedPm}
                            bookedAm={bookedAm}
                            bookedPm={bookedPm}
                            bookedType={bookedType}
                            isInRange={isInRange}
                            isAmBlocked={bookedAm}
                            isPmBlocked={bookedPm}
                            onDayClick={(d, part) =>
                                !isWeekendDay && onSelect(d, part)
                            }
                            onMouseEnter={() =>
                                !isWeekendDay && onHover(dayDate)
                            }
                            onMouseLeave={() => !isWeekendDay && onHover(null)}
                            className={cn(isInRange && "rounded-none")}
                        />
                    )
                })}
            </div>
        </div>
    )
}
