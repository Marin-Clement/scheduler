"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { createLeaveRequest } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"
import {
    LeaveRequestComposer,
    LeaveRequestItem,
    LeaveBalanceItem,
} from "@/components/ui/date-range-picker"

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus()

    return (
        <Button
            type="submit"
            disabled={pending || disabled}
            className="w-full sm:w-auto"
        >
            {pending ? "Submitting..." : "Submit Request"}
        </Button>
    )
}

export default function RequestForm({
    leaveTypes,
    bookedRequests,
    leaveBalances,
}: {
    leaveTypes: { id: string; name: string; color?: string }[]
    bookedRequests: LeaveRequestItem[]
    leaveBalances: LeaveBalanceItem[]
}) {
    const [requests, setRequests] = useState<LeaveRequestItem[]>([])

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    New Leave Request
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form action={createLeaveRequest} className="space-y-6">
                    {/* Visual Composer */}
                    <div className="border rounded-lg p-4 bg-card">
                        <LeaveRequestComposer
                            leaveTypes={leaveTypes}
                            requests={requests}
                            bookedRequests={bookedRequests}
                            leaveBalances={leaveBalances}
                            onRequestsChange={setRequests}
                        />
                    </div>

                    {/* Hidden input to pass data to server action */}
                    <input
                        type="hidden"
                        name="request_data"
                        value={JSON.stringify(requests)}
                    />

                    <div className="space-y-2 max-w-md">
                        <Label htmlFor="subject">Subject (Optional)</Label>
                        <Input
                            type="text"
                            name="subject"
                            id="subject"
                            placeholder="e.g. Vacation in Hawaii"
                        />
                        <p className="text-xs text-muted-foreground">
                            This subject will be applied to all{" "}
                            {requests.length} selected ranges.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <SubmitButton disabled={requests.length === 0} />
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
