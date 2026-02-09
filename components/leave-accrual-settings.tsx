'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { updateDefaultMonthlyIncrement, bulkUpdateMonthlyIncrement } from '@/actions/balances'
import { useFormStatus } from 'react-dom'
import { Settings, Users } from 'lucide-react'

interface LeaveType {
    id: string
    name: string
    code: string
    color: string
    default_monthly_increment?: number
}

interface LeaveAccrualSettingsProps {
    leaveTypes: LeaveType[]
    orgId: string
}

function SubmitButton({ children }: { children: React.ReactNode }) {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" size="sm" disabled={pending}>
            {pending ? 'Saving...' : children}
        </Button>
    )
}

export function LeaveAccrualSettings({ leaveTypes, orgId }: LeaveAccrualSettingsProps) {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    async function handleDefaultUpdate(formData: FormData) {
        formData.append('path', '/hr')
        const result = await updateDefaultMonthlyIncrement(formData)
        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Default increment updated!' })
        }
        setTimeout(() => setMessage(null), 3000)
    }

    async function handleBulkUpdate(formData: FormData) {
        formData.append('orgId', orgId)
        formData.append('path', '/hr')
        const result = await bulkUpdateMonthlyIncrement(formData)
        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Applied to all employees!' })
        }
        setTimeout(() => setMessage(null), 3000)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Leave Accrual Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {message && (
                    <div className={`p-2 rounded text-sm ${
                        message.type === 'success' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-4">
                    {leaveTypes.map((leaveType) => (
                        <div 
                            key={leaveType.id} 
                            className="p-4 border rounded-lg space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <Badge
                                    variant="outline"
                                    style={{
                                        borderColor: leaveType.color,
                                        color: leaveType.color,
                                        backgroundColor: leaveType.color ? `${leaveType.color}15` : 'transparent'
                                    }}
                                >
                                    {leaveType.name} ({leaveType.code})
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Current default: {leaveType.default_monthly_increment ?? 0} days/month
                                </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Update default */}
                                <form action={handleDefaultUpdate} className="space-y-2">
                                    <input type="hidden" name="leaveTypeId" value={leaveType.id} />
                                    <Label htmlFor={`default-${leaveType.id}`} className="text-xs">
                                        Set Default Monthly Increment
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id={`default-${leaveType.id}`}
                                            name="increment"
                                            type="number"
                                            step="0.25"
                                            min="0"
                                            placeholder="e.g., 2.5"
                                            className="flex-1"
                                            defaultValue={leaveType.default_monthly_increment ?? ''}
                                        />
                                        <SubmitButton>Save</SubmitButton>
                                    </div>
                                </form>

                                {/* Bulk apply */}
                                <form action={handleBulkUpdate} className="space-y-2">
                                    <input type="hidden" name="leaveTypeId" value={leaveType.id} />
                                    <Label htmlFor={`bulk-${leaveType.id}`} className="text-xs flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        Apply to All Employees
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id={`bulk-${leaveType.id}`}
                                            name="increment"
                                            type="number"
                                            step="0.25"
                                            min="0"
                                            placeholder="e.g., 2.5"
                                            className="flex-1"
                                        />
                                        <SubmitButton>Apply All</SubmitButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>

                {leaveTypes.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">
                        No leave types configured. Create leave types first.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
