import * as React from "react";
import { addMonths, isSameDay, isAfter, isBefore, differenceInBusinessDays, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2, Plus, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Select,
} from "@/components/ui/select";

import { MonthHeader, DayGrid } from "./molecules";
import { DateRange, LeaveType, LeaveRequestItem, DayPart } from "./types";

interface LeaveRequestComposerProps {
  className?: string;
  leaveTypes?: { id: string; name: string; color?: string }[];
  requests?: LeaveRequestItem[];
  onRequestsChange?: (requests: LeaveRequestItem[]) => void;
  // Optional: External control for drafts or other props
}

export function LeaveRequestComposer({ 
    className, 
    leaveTypes = [], 
    requests: controlledRequests,
    onRequestsChange
}: LeaveRequestComposerProps) {
  // State for the Draft (current selection)
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>();
  const [draftTypeId, setDraftTypeId] = React.useState<string>("");
  
  // Initialize draft type when leaveTypes load
  React.useEffect(() => {
    if (leaveTypes.length > 0 && !draftTypeId) {
        setDraftTypeId(leaveTypes[0].id);
    }
  }, [leaveTypes, draftTypeId]);

  // Internal state if not controlled
  const [internalRequests, setInternalRequests] = React.useState<LeaveRequestItem[]>([]);
  const requests = controlledRequests ?? internalRequests;
  const setRequests = (newRequests: LeaveRequestItem[]) => {
      if (onRequestsChange) {
          onRequestsChange(newRequests);
      } else {
          setInternalRequests(newRequests);
      }
  };
  
  // View State
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  // Handlers
  const handleDateSelect = (date: Date, part: DayPart) => {
    // If start exists and no end:
    // Check if new date is before. If so, reset start.
    // Else set end.

    if (draftRange?.from && !draftRange.to) {
        if (isAfter(date, draftRange.from) || isSameDay(date, draftRange.from)) {
            // Set End Date
            // If user clicked AM on end date, then end is AM (HalfDayEnd=true)
            // If user clicked PM on end date, then end is PM (Full Day, HalfDayEnd=false)
            setDraftRange({ 
                ...draftRange, 
                to: date,
                toHalfDay: part === 'am' 
            });
        } else {
            // New Start Date (clicked before current start)
            setDraftRange({ 
                from: date, 
                to: undefined, 
                fromHalfDay: part === 'pm', // If clicked PM, start is half day
                toHalfDay: false 
            });
        }
    } else {
        // Start New Range
        setDraftRange({ 
            from: date, 
            to: undefined, 
            fromHalfDay: part === 'pm', // Start PM check
            toHalfDay: false 
        });
    }
  };

  const handleHover = (date: Date | null) => {
    // Optional: could implement hover preview state here
  };

  const addRequest = () => {
    if (!draftRange?.from || !draftTypeId) return;
    
    // Default single day if no end date
    const finalRange = {
        ...draftRange,
        to: draftRange.to || draftRange.from
    };

    const newItem: LeaveRequestItem = {
      id: Math.random().toString(36).substr(2, 9),
      range: finalRange,
      type: draftTypeId,
    };

    setRequests([...requests, newItem]);
    setDraftRange(undefined); // Reset draft
  };

  const removeRequest = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
  };

  // Helpers
  const calculateDays = (range: DateRange) => {
    if (!range.from) return 0;
    const end = range.to || range.from;
    
    // Basic business days calculation (Mon-Fri)
    const days = differenceInBusinessDays(end, range.from) + 1;
    
    // Half day adjustments
    let adjustment = 0;
    if (range.fromHalfDay) adjustment -= 0.5;
    if (range.toHalfDay) adjustment -= 0.5;
    
    return Math.max(0, days + adjustment);
  };

  const totalDays = requests.reduce((acc, req) => acc + calculateDays(req.range), 0);

  // Helper to get color/name from ID
  const getLeaveTypeDetails = (id: string) => {
      const type = leaveTypes.find(t => t.id === id);
      // Fallback normalization for predefined colors in molecules/atoms if no explicit color
      // But actually atoms expects 'paid' | 'remote' etc keys for colors. 
      // We might need to map DB names to those keys or pass hex colors.
      // For now, let's try to map name to key if possible, or use a default.
      
      let normalizedKey = "other";
      if (type) {
         const lower = type.name.toLowerCase();
         if (lower.includes("pay") || lower.includes("congs")) normalizedKey = "paid";
         else if (lower.includes("tl") || lower.includes("remote")) normalizedKey = "remote";
         else if (lower.includes("maladi") || lower.includes("sick")) normalizedKey = "sickness";
         else if (lower.includes("sans") || lower.includes("unpaid")) normalizedKey = "unpaid";
      }
      return { 
          name: type?.name || "Unknown", 
          colorKey: normalizedKey 
      };
  };

  return (
    <div className={cn("flex flex-col md:flex-row gap-6", className)}>
      {/* --- Calendar Section --- */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
           <h2 className="text-lg font-semibold">Select Dates</h2>
           <div className="flex gap-2">
              <Select 
                 value={draftTypeId}
                 onChange={(e) => setDraftTypeId(e.target.value)}
                 className="h-9 w-[200px]"
              >
                  {leaveTypes.length === 0 && <option value="">Loading types...</option>}
                  {leaveTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
              </Select>
           </div>
        </div>

        <div className="rounded-md border p-4 bg-background shadow-sm">
           <div className="flex flex-col lg:flex-row gap-4">
              {/* Month 1 */}
              <div className="flex-1">
                 <MonthHeader 
                    currentMonth={currentMonth}
                    onPrev={() => setCurrentMonth(addMonths(currentMonth, -1))}
                    hideNext
                 />
                 <DayGrid
                    currentMonth={currentMonth}
                    selectedRange={draftRange || {}}
                    bookedRanges={requests.map(r => ({
                        ...r,
                        type: getLeaveTypeDetails(r.type).colorKey // Map ID to color key for display
                    }))}
                    excludeWeekends={true}
                    onSelect={handleDateSelect}
                    hoverDate={null}
                    onHover={handleHover}
                 />
              </div>
              
              {/* Month 2 */} // Hide on small screens?
              <div className="hidden lg:block flex-1 border-l pl-4">
                 <MonthHeader 
                    currentMonth={addMonths(currentMonth, 1)}
                    onNext={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    hidePrev
                 />
                 <DayGrid
                    currentMonth={addMonths(currentMonth, 1)}
                    selectedRange={draftRange || {}}
                    bookedRanges={requests.map(r => ({
                        ...r,
                        type: getLeaveTypeDetails(r.type).colorKey
                    }))}
                    excludeWeekends={true}
                    onSelect={handleDateSelect}
                    hoverDate={null}
                    onHover={handleHover}
                 />
              </div>
           </div>
           
           {/* Draft Controls (Bottom of Calendar) */}
           {draftRange?.from && (
             <div className="mt-4 pt-4 border-t flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-4 text-sm items-center">
                   <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Start:</span>
                      <span className="font-medium text-foreground">
                        {draftRange.from.toLocaleDateString()} 
                        {draftRange.fromHalfDay ? " (PM)" : ""}
                      </span>
                   </div>
                   {draftRange.to && (
                       <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">End:</span>
                          <span className="font-medium text-foreground">
                             {draftRange.to.toLocaleDateString()}
                             {draftRange.toHalfDay ? " (AM)" : ""}
                          </span>
                       </div>
                   )}
                </div>
                <Button size="sm" onClick={addRequest} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add to Request
                </Button>
             </div>
           )}
        </div>
      </div>

      {/* --- Cart Section --- */}
      <div className="w-full md:w-[320px] shrink-0 space-y-4">
         <h2 className="text-lg font-semibold">Request Summary</h2>
         
         <div className="rounded-md border bg-muted/20 p-4 space-y-4">
            <div className="space-y-3">
               {requests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                     <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                     <p>No dates selected yet.</p>
                  </div>
               ) : (
                  requests.map((req) => {
                     const details = getLeaveTypeDetails(req.type);
                     // Helper map for dot colors
                     const colorClass = {
                         "paid": "bg-primary",
                         "unpaid": "bg-amber-500",
                         "remote": "bg-blue-500",
                         "sickness": "bg-red-500",
                         "other": "bg-gray-500"
                     }[details.colorKey] || "bg-gray-500";

                     return (
                     <div key={req.id} className="flex flex-col gap-2 p-3 bg-background rounded-md border shadow-sm group">
                        <div className="flex items-start justify-between">
                           <div className="flex items-center gap-2">
                              <span className={cn("w-2 h-2 rounded-full", colorClass)} />
                              <span className="font-medium text-sm capitalize">{details.name}</span>
                           </div>
                           <button onClick={() => removeRequest(req.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="h-4 w-4" />
                           </button>
                        </div>
                        
                        <div className="flex items-baseline justify-between text-sm">
                           <span className="text-muted-foreground">
                              {req.range.from?.toLocaleDateString()} 
                              {req.range.to ? ` - ${req.range.to.toLocaleDateString()}` : ""}
                           </span>
                           <span className="font-semibold">
                              {calculateDays(req.range)} days
                           </span>
                        </div>
                     </div>
                  )})
               )}
            </div>
            
            <div className="pt-4 border-t flex items-center justify-between">
               <span className="font-medium">Total Days Required</span>
               <span className="text-xl font-bold text-primary">{totalDays}</span>
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
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Paid Leave</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Remote</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Unpaid</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-500" /> Other/Sick</div>
         </div>
      </div>
    </div>
  );
}
