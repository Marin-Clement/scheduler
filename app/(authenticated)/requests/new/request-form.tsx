'use client'

import { useFormStatus } from 'react-dom'
import { createLeaveRequest } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays } from 'lucide-react'

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? 'Submitting...' : 'Submit Request'}
        </Button>
    )
}

export default function RequestForm({ leaveTypes }: { leaveTypes: any[] }) {
    return (
        <Card className="max-w-2xl mx-auto shadow-md">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    New Leave Request
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form action={createLeaveRequest} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="leave_type_id">Leave Type</Label>
                        <Select
                            id="leave_type_id"
                            name="leave_type_id"
                            required
                        >
                            <option value="">Select a leave type</option>
                            {leaveTypes.map((type: any) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                type="date"
                                name="start_date"
                                id="start_date"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="start_half">Start Period</Label>
                            <Select
                                name="start_half"
                                id="start_half"
                            >
                                <option value="AM">Morning</option>
                                <option value="PM">Afternoon</option>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                type="date"
                                name="end_date"
                                id="end_date"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_half">End Period</Label>
                            <Select
                                name="end_half"
                                id="end_half"
                            >
                                <option value="PM">Afternoon</option>
                                <option value="AM">Morning</option>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject (Optional)</Label>
                        <Input
                            type="text"
                            name="subject"
                            id="subject"
                            placeholder="e.g. Vacation in Hawaii"
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <SubmitButton />
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
