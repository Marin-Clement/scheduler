import * as React from "react"
import {
    addMonths,
    isSameDay,
    isAfter,
    isWeekend,
    differenceInBusinessDays,
} from "date-fns"
import { Trash2, Plus, Calendar as CalendarIcon, ListX } from "lucide-react"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { MonthHeader, DayGrid } from "./molecules"
import { DateRange, LeaveRequestItem, DayPart, LeaveBalanceItem } from "./types"

type LeaveCategory = "paid" | "unpaid" | "remote" | "sickness" | "other"

function stripAccents(s: string) {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function normalizeLeaveCategory(
    name: string,
    code?: string | null,
): LeaveCategory {
    const source = stripAccents(`${code ?? ""} ${name}`.toLowerCase())
    if (source.includes("sick") || source.includes("maladi")) {
        return "sickness"
    }
    if (
        source.includes("unpaid") ||
        source.includes("sans") ||
        source.includes("solde")
    ) {
        return "unpaid"
    }
    if (
        source.includes("paid") ||
        source.includes("cong") ||
        source.includes("cp")
    ) {
        return "paid"
    }
    if (
        source.includes("remote") ||
        source.includes("tele") ||
        source.includes("tt")
    ) {
        return "remote"
    }
    return "other"
}

interface LeaveRequestComposerProps {
    className?: string
    leaveTypes?: { id: string; name: string; color?: string }[]
    requests?: LeaveRequestItem[]
    bookedRequests?: LeaveRequestItem[]
    leaveBalances?: LeaveBalanceItem[]
    onRequestsChange?: (requests: LeaveRequestItem[]) => void
    // Optional: External control for drafts or other props
}

export function LeaveRequestComposer({
    className,
    leaveTypes = [],
    requests: controlledRequests,
    bookedRequests = [],
    leaveBalances = [],
    onRequestsChange,
}: LeaveRequestComposerProps) {
    // State for the Draft (current selection)
    const [draftRange, setDraftRange] = React.useState<DateRange | undefined>()
    const [draftTypeId, setDraftTypeId] = React.useState<string>("")
    const [intelligentMode, setIntelligentMode] = React.useState(false)
    const requestSequenceRef = React.useRef(0)

    // Initialize draft type when leaveTypes load
    React.useEffect(() => {
        if (leaveTypes.length > 0 && !draftTypeId) {
            setDraftTypeId(leaveTypes[0].id)
        }
    }, [leaveTypes, draftTypeId])

    // Internal state if not controlled
    const [internalRequests, setInternalRequests] = React.useState<
        LeaveRequestItem[]
    >([])
    const requests = controlledRequests ?? internalRequests
    const setRequests = (newRequests: LeaveRequestItem[]) => {
        if (onRequestsChange) {
            onRequestsChange(newRequests)
        } else {
            setInternalRequests(newRequests)
        }
    }

    // View State
    const [currentMonth, setCurrentMonth] = React.useState(new Date())
    const [hoverDate, setHoverDate] = React.useState<Date | null>(null)

    // Handlers
    const handleDateSelect = (date: Date, part: DayPart) => {
        // If start exists and no end:
        // Check if new date is before. If so, reset start.
        // Else set end.

        if (draftRange?.from && !draftRange.to) {
            if (
                isAfter(date, draftRange.from) ||
                isSameDay(date, draftRange.from)
            ) {
                // Set End Date
                // If user clicked AM on end date, then end is AM (HalfDayEnd=true)
                // If user clicked PM on end date, then end is PM (Full Day, HalfDayEnd=false)
                setDraftRange({
                    ...draftRange,
                    to: date,
                    toHalfDay: part === "am",
                })
            } else {
                // New Start Date (clicked before current start)
                setDraftRange({
                    from: date,
                    to: undefined,
                    fromHalfDay: part === "pm", // If clicked PM, start is half day
                    toHalfDay: part === "am", // AM single-click means morning half-day
                })
            }
        } else {
            // Start New Range
            setDraftRange({
                from: date,
                to: undefined,
                fromHalfDay: part === "pm", // Start PM check
                toHalfDay: part === "am", // AM single-click means morning half-day
            })
        }
    }

    const handleHover = (date: Date | null) => {
        setHoverDate(date)
    }

    const splitRangeForAllocation = (range: DateRange): LeaveRequestItem[] => {
        if (!range.from) return []
        const end = range.to || range.from
        const totalDaysNeeded = calculateDays(range)
        let remaining = totalDaysNeeded
        const paidRemaining = Math.max(0, paidCapacity - usedByCategory.paid)

        const paidTypeId = getFirstTypeByCategory("paid")
        const unpaidTypeId = getFirstTypeByCategory("unpaid")
        const remoteTypeId = getFirstTypeByCategory("remote")

        const segments: { typeId: string; days: number }[] = []

        if (paidTypeId && paidRemaining > 0 && remaining > 0) {
            const d = Math.min(remaining, paidRemaining)
            segments.push({ typeId: paidTypeId, days: d })
            remaining -= d
        }
        if (unpaidTypeId && remaining > 0) {
            segments.push({ typeId: unpaidTypeId, days: remaining })
            remaining = 0
        }
        if (remoteTypeId && remaining > 0) {
            segments.push({ typeId: remoteTypeId, days: remaining })
            remaining = 0
        }
        if (remaining > 0) {
            const fallback = paidTypeId || leaveTypes[0]?.id
            if (fallback) segments.push({ typeId: fallback, days: remaining })
        }

        // Single segment — no need to split the date range
        if (segments.length <= 1) {
            const typeId = segments[0]?.typeId
            if (!typeId) return []
            return [
                {
                    id: `draft-${requestSequenceRef.current++}`,
                    range,
                    type: typeId,
                },
            ]
        }

        // Multiple segments — split the date range by half-day slots
        type Slot = { date: Date; half: "am" | "pm" }
        const slots: Slot[] = []
        const cursor = new Date(range.from)
        while (cursor <= end) {
            if (!isWeekend(cursor)) {
                const isFirst = isSameDay(cursor, range.from)
                const isLast = isSameDay(cursor, end)
                if (!(isFirst && range.fromHalfDay)) {
                    slots.push({ date: new Date(cursor), half: "am" })
                }
                if (!(isLast && range.toHalfDay)) {
                    slots.push({ date: new Date(cursor), half: "pm" })
                }
            }
            cursor.setDate(cursor.getDate() + 1)
        }

        const items: LeaveRequestItem[] = []
        let slotIdx = 0

        for (const seg of segments) {
            const count = Math.round(seg.days * 2)
            if (count <= 0 || slotIdx >= slots.length) continue
            const segSlots = slots.slice(slotIdx, slotIdx + count)
            slotIdx += count
            if (segSlots.length === 0) continue

            const first = segSlots[0]
            const last = segSlots[segSlots.length - 1]

            items.push({
                id: `draft-${requestSequenceRef.current++}`,
                range: {
                    from: first.date,
                    to: last.date,
                    fromHalfDay: first.half === "pm",
                    toHalfDay: last.half === "am",
                },
                type: seg.typeId,
            })
        }

        return items
    }

    const addRequest = () => {
        if (!draftRange?.from) return

        // Default single day if no end date
        const finalRange: DateRange = {
            ...draftRange,
            to: draftRange.to || draftRange.from,
            toHalfDay:
                draftRange.to || draftRange.fromHalfDay
                    ? draftRange.toHalfDay
                    : true,
        }

        if (intelligentMode) {
            const newItems = splitRangeForAllocation(finalRange)
            if (newItems.length > 0) {
                setRequests([...requests, ...newItems])
            }
        } else {
            if (!draftTypeId) return
            const newItem: LeaveRequestItem = {
                id: `draft-${requestSequenceRef.current++}`,
                range: finalRange,
                type: draftTypeId,
            }
            setRequests([...requests, newItem])
        }

        setDraftRange(undefined) // Reset draft
    }

    const removeRequest = (id: string) => {
        setRequests(requests.filter((r) => r.id !== id))
    }

    // Helpers
    const calculateDays = (range: DateRange) => {
        if (!range.from) return 0
        const end = range.to || range.from

        // Basic business days calculation (Mon-Fri)
        const days = differenceInBusinessDays(end, range.from) + 1

        // Half day adjustments
        let adjustment = 0
        if (range.fromHalfDay) adjustment -= 0.5
        if (range.toHalfDay) adjustment -= 0.5

        return Math.max(0, days + adjustment)
    }

    const totalDays = requests.reduce(
        (acc, req) => acc + calculateDays(req.range),
        0,
    )

    const draftDays = draftRange?.from
        ? calculateDays({
              ...draftRange,
              to: draftRange.to || draftRange.from,
          })
        : 0

    const requestedDays = totalDays + draftDays

    const mergedBookedRanges = [...bookedRequests, ...requests]

    const categoryByTypeId = (() => {
        const map = new Map<string, LeaveCategory>()
        for (const leaveType of leaveTypes) {
            map.set(leaveType.id, normalizeLeaveCategory(leaveType.name))
        }
        for (const balance of leaveBalances) {
            map.set(
                balance.leaveTypeId,
                normalizeLeaveCategory(balance.name, balance.code),
            )
        }
        return map
    })()

    // Helper to get color/name from ID — reuses categoryByTypeId for consistent mapping
    const getLeaveTypeDetails = (id: string) => {
        const type = leaveTypes.find((t) => t.id === id)
        const normalizedKey = categoryByTypeId.get(id) || "other"
        return {
            name: type?.name || "Unknown",
            colorKey: normalizedKey,
        }
    }

    const usedByCategory = requests.reduce(
        (acc, requestItem) => {
            const category = categoryByTypeId.get(requestItem.type) || "other"
            acc[category] += calculateDays(requestItem.range)
            return acc
        },
        { paid: 0, unpaid: 0, remote: 0, sickness: 0, other: 0 } as Record<
            LeaveCategory,
            number
        >,
    )

    const paidCapacity = leaveBalances.reduce((sum, balance) => {
        const category = categoryByTypeId.get(balance.leaveTypeId)
        if (category !== "paid") return sum
        return sum + Math.max(0, Number(balance.balance) || 0)
    }, 0)

    const hasUnpaidType = leaveTypes.some(
        (leaveType) => categoryByTypeId.get(leaveType.id) === "unpaid",
    )

    const hasRemoteType = leaveTypes.some(
        (leaveType) => categoryByTypeId.get(leaveType.id) === "remote",
    )

    const getFirstTypeByCategory = (category: LeaveCategory) => {
        return (
            leaveTypes.find(
                (leaveType) => categoryByTypeId.get(leaveType.id) === category,
            )?.id || ""
        )
    }

    const chooseTypeForDays = (daysNeeded: number) => {
        const needed = Math.max(0, daysNeeded)
        const paidRemaining = Math.max(0, paidCapacity - usedByCategory.paid)
        const paidTypeId = getFirstTypeByCategory("paid")
        const unpaidTypeId = getFirstTypeByCategory("unpaid")
        const remoteTypeId = getFirstTypeByCategory("remote")

        if (paidTypeId && paidRemaining >= needed) {
            return paidTypeId
        }
        if (unpaidTypeId) {
            return unpaidTypeId
        }
        if (remoteTypeId) {
            return remoteTypeId
        }
        if (paidTypeId) {
            return paidTypeId
        }

        return ""
    }

    const suggestedAllocation = (() => {
        let remaining = Math.max(0, requestedDays)
        const paidRemaining = Math.max(0, paidCapacity - usedByCategory.paid)
        const paid = Math.min(remaining, paidRemaining)
        remaining -= paid

        const unpaid = hasUnpaidType ? remaining : 0
        remaining -= unpaid

        const remote = hasRemoteType ? remaining : 0
        remaining -= remote

        return {
            paid,
            unpaid,
            remote,
            overflow: remaining,
        }
    })()

    const suggestedTypeId = (() => {
        const fallbackDays = draftDays > 0 ? draftDays : 1
        return chooseTypeForDays(fallbackDays)
    })()

    React.useEffect(() => {
        if (!draftTypeId && suggestedTypeId) {
            setDraftTypeId(suggestedTypeId)
        }
    }, [draftTypeId, suggestedTypeId])

    React.useEffect(() => {
        if (intelligentMode && suggestedTypeId) {
            setDraftTypeId(suggestedTypeId)
        }
    }, [intelligentMode, suggestedTypeId])

    return (
        <div className={cn("flex flex-col md:flex-row gap-6", className)}>
            {/* --- Calendar Section --- */}
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Select Dates</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                            Mode intelligent
                        </span>
                        <Switch
                            checked={intelligentMode}
                            onChange={(e) =>
                                setIntelligentMode(e.target.checked)
                            }
                        />
                    </div>
                </div>

                {!intelligentMode && (
                    <div className="flex gap-2">
                        <Select
                            value={draftTypeId}
                            onChange={(e) => setDraftTypeId(e.target.value)}
                            className="h-9 w-[220px]"
                        >
                            {leaveTypes.length === 0 && (
                                <option value="">Loading types...</option>
                            )}
                            {leaveTypes.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                )}

                {intelligentMode && (
                    <div className="text-xs text-muted-foreground rounded-md border bg-muted/20 px-3 py-2">
                        {requestedDays > 0 ? (
                            <p>
                                Proposition intelligente (
                                {requestedDays.toFixed(1)} j):
                                {suggestedAllocation.paid > 0 &&
                                    ` ${suggestedAllocation.paid.toFixed(1)} payé`}
                                {suggestedAllocation.unpaid > 0 &&
                                    ` • ${suggestedAllocation.unpaid.toFixed(1)} non payé`}
                                {suggestedAllocation.remote > 0 &&
                                    ` • ${suggestedAllocation.remote.toFixed(1)} télétravail`}
                                {suggestedAllocation.overflow > 0 &&
                                    ` • ${suggestedAllocation.overflow.toFixed(1)} hors balance`}
                            </p>
                        ) : (
                            <p>
                                Sélectionnez des dates — le mode intelligent
                                répartira automatiquement (payé → non payé →
                                télétravail).
                            </p>
                        )}
                        {usedByCategory.paid > 0 && (
                            <p className="mt-1">
                                {usedByCategory.paid.toFixed(1)} j payé déjà
                                dans le panier (pris en compte).
                            </p>
                        )}
                        <p className="mt-1">
                            Le type maladie est exclu du mode intelligent.
                        </p>
                    </div>
                )}

                <div className="rounded-md border p-4 bg-background shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Month 1 */}
                        <div className="flex-1">
                            <MonthHeader
                                currentMonth={currentMonth}
                                onPrev={() =>
                                    setCurrentMonth(addMonths(currentMonth, -1))
                                }
                                hideNext
                            />
                            <DayGrid
                                currentMonth={currentMonth}
                                selectedRange={draftRange || {}}
                                bookedRanges={mergedBookedRanges.map((r) => ({
                                    ...r,
                                    type: getLeaveTypeDetails(r.type).colorKey, // Map ID to color key for display
                                }))}
                                excludeWeekends={true}
                                onSelect={handleDateSelect}
                                hoverDate={hoverDate}
                                onHover={handleHover}
                            />
                        </div>
                        {/* Month 2 - hidden on small screens */}
                        <div className="hidden lg:block flex-1 border-l pl-4">
                            <MonthHeader
                                currentMonth={addMonths(currentMonth, 1)}
                                onNext={() =>
                                    setCurrentMonth(addMonths(currentMonth, 1))
                                }
                                hidePrev
                            />
                            <DayGrid
                                currentMonth={addMonths(currentMonth, 1)}
                                selectedRange={draftRange || {}}
                                bookedRanges={mergedBookedRanges.map((r) => ({
                                    ...r,
                                    type: getLeaveTypeDetails(r.type).colorKey,
                                }))}
                                excludeWeekends={true}
                                onSelect={handleDateSelect}
                                hoverDate={hoverDate}
                                onHover={handleHover}
                            />
                        </div>
                    </div>

                    {/* Draft Controls (Bottom of Calendar) */}
                    {draftRange?.from && (
                        <div className="mt-4 pt-4 border-t flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-4 text-sm items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                        Start:
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {draftRange.from.toLocaleDateString()}
                                        {draftRange.fromHalfDay ? " (PM)" : ""}
                                    </span>
                                </div>
                                {draftRange.to && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">
                                            End:
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {draftRange.to.toLocaleDateString()}
                                            {draftRange.toHalfDay
                                                ? " (AM)"
                                                : ""}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <Button
                                size="sm"
                                onClick={addRequest}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add to Request
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Cart Section --- */}
            <div className="w-full md:w-[320px] shrink-0 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Request Summary</h2>
                    {requests.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRequests([])}
                            className="gap-1.5 text-muted-foreground hover:text-destructive"
                        >
                            <ListX className="h-4 w-4" />
                            Tout effacer
                        </Button>
                    )}
                </div>

                <div className="rounded-md border bg-muted/20 p-4 space-y-4">
                    <div className="space-y-3">
                        {requests.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No dates selected yet.</p>
                            </div>
                        ) : (
                            requests.map((req) => {
                                const details = getLeaveTypeDetails(req.type)
                                // Helper map for dot colors
                                const colorClass =
                                    {
                                        paid: "bg-primary",
                                        unpaid: "bg-amber-500",
                                        remote: "bg-blue-500",
                                        sickness: "bg-red-500",
                                        other: "bg-gray-500",
                                    }[details.colorKey] || "bg-gray-500"

                                return (
                                    <div
                                        key={req.id}
                                        className="flex flex-col gap-2 p-3 bg-background rounded-md border shadow-sm group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        colorClass,
                                                    )}
                                                />
                                                <span className="font-medium text-sm capitalize">
                                                    {details.name}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    removeRequest(req.id)
                                                }
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-baseline justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {req.range.from?.toLocaleDateString()}
                                                {req.range.to
                                                    ? ` - ${req.range.to.toLocaleDateString()}`
                                                    : ""}
                                            </span>
                                            <span className="font-semibold">
                                                {calculateDays(req.range)} days
                                            </span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between">
                        <span className="font-medium">Total Days Required</span>
                        <span className="text-xl font-bold text-primary">
                            {totalDays}
                        </span>
                    </div>

                    {/* Note: Submit button is now external usually, but we keep a disabled one visually if not controlled? 
                Actually the user wants integration. The form will have the submit button.
                We can hide this button if controlled? Or keep it as "Confirm Selection"?
                For now let's hide it if controlled, or just remove it as the parent form handles submission.
             */}
                </div>

                {/* Helper Legend - Dynamic? */}
                <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 p-2">
                    {/* Map standard keys */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary" /> Paid
                        Leave
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />{" "}
                        Remote
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />{" "}
                        Unpaid
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-gray-500" />{" "}
                        Other/Sick
                    </div>
                </div>
            </div>
        </div>
    )
}
