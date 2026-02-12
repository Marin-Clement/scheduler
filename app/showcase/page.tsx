import { LeaveRequestComposer } from "@/components/ui/date-range-picker";

export default function ShowcasePage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Advanced Leave Composer</h1>
        <p className="text-muted-foreground mb-8">
          Select multiple ranges of different types. Weekends are automatically excluded from the count.
        </p>
        
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <LeaveRequestComposer 
            leaveTypes={[
                { id: "1", name: "Paid Leave", color: "bg-primary" },
                { id: "2", name: "Remote Work", color: "bg-blue-500" },
                { id: "3", name: "Unpaid Leave", color: "bg-amber-500" },
                { id: "4", name: "Sick Leave", color: "bg-red-500" }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
