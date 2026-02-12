export interface DateRange {
  from?: Date;
  to?: Date;
  fromHalfDay?: boolean; // If true, start date is PM (Afternoon)
  toHalfDay?: boolean;   // If true, end date is AM (Morning)
}

export type LeaveType = string;

export type DayPart = 'am' | 'pm' | 'full';

export interface LeaveRequestItem {
  id: string; // Unique ID for keying
  range: DateRange;
  type: LeaveType;
}
