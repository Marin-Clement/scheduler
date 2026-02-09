'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
    createRemoteWorkPolicy, 
    updateRemoteWorkPolicy, 
    deleteRemoteWorkPolicy,
    applyPolicyToAllUsers 
} from '@/actions/remote-work'
import { useFormStatus } from 'react-dom'
import { Home, Trash2, Plus, Users } from 'lucide-react'

const DAYS_OF_WEEK = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' },
]

interface Policy {
    id: string
    policy_type: 'flexible' | 'fixed'
    days_per_week: number
    fixed_days: string[] | null
    is_mandatory: boolean
    profile_id: string | null
    profiles?: {
        id: string
        first_name: string
        last_name: string
    } | null
}

interface Employee {
    id: string
    first_name: string
    last_name: string
}

interface RemoteWorkSettingsProps {
    policies: Policy[]
    employees: Employee[]
    orgId: string
}

function SubmitButton({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'destructive' }) {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" size="sm" variant={variant} disabled={pending}>
            {pending ? '...' : children}
        </Button>
    )
}

export function RemoteWorkSettings({ policies, employees, orgId }: RemoteWorkSettingsProps) {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [showNewForm, setShowNewForm] = useState(false)
    const [policyType, setPolicyType] = useState<'flexible' | 'fixed'>('flexible')
    const [selectedDays, setSelectedDays] = useState<string[]>([])

    const orgWidePolicy = policies.find(p => p.profile_id === null)
    const userPolicies = policies.filter(p => p.profile_id !== null)

    async function handleCreate(formData: FormData) {
        formData.append('orgId', orgId)
        formData.append('path', '/hr')
        if (policyType === 'fixed') {
            formData.append('fixedDays', selectedDays.join(','))
        }
        const result = await createRemoteWorkPolicy(formData)
        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Policy created!' })
            setShowNewForm(false)
            setSelectedDays([])
        }
        setTimeout(() => setMessage(null), 3000)
    }

    async function handleDelete(formData: FormData) {
        formData.append('path', '/hr')
        const result = await deleteRemoteWorkPolicy(formData)
        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Policy deleted!' })
        }
        setTimeout(() => setMessage(null), 3000)
    }

    async function handleApplyToAll(formData: FormData) {
        formData.append('orgId', orgId)
        formData.append('path', '/hr')
        const result = await applyPolicyToAllUsers(formData)
        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Policy applied to all!' })
        }
        setTimeout(() => setMessage(null), 3000)
    }

    function toggleDay(day: string) {
        setSelectedDays(prev => 
            prev.includes(day) 
                ? prev.filter(d => d !== day)
                : [...prev, day]
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Remote Work (Télétravail) Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {message && (
                    <div className={`p-2 rounded text-sm ${
                        message.type === 'success' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Org-wide default policy section */}
                <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Organization Default Policy
                    </h4>
                    
                    {orgWidePolicy ? (
                        <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Badge variant={orgWidePolicy.policy_type === 'flexible' ? 'default' : 'secondary'}>
                                        {orgWidePolicy.policy_type === 'flexible' ? 'Flexible' : 'Fixed Days'}
                                    </Badge>
                                    <Badge variant={orgWidePolicy.is_mandatory ? 'destructive' : 'outline'} className="ml-2">
                                        {orgWidePolicy.is_mandatory ? 'Mandatory' : 'Optional'}
                                    </Badge>
                                </div>
                                <form action={handleDelete}>
                                    <input type="hidden" name="policyId" value={orgWidePolicy.id} />
                                    <SubmitButton variant="destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </SubmitButton>
                                </form>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {orgWidePolicy.days_per_week} day(s) per week
                                {orgWidePolicy.policy_type === 'fixed' && orgWidePolicy.fixed_days && (
                                    <> - {orgWidePolicy.fixed_days.join(', ')}</>
                                )}
                            </p>
                        </div>
                    ) : (
                        <form action={handleApplyToAll} className="p-4 border rounded-lg space-y-3">
                            <p className="text-sm text-muted-foreground">No default policy set. Create one:</p>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div>
                                    <Label htmlFor="org-policy-type" className="text-xs">Type</Label>
                                    <select
                                        id="org-policy-type"
                                        name="policyType"
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                    >
                                        <option value="flexible">Flexible (pick days)</option>
                                        <option value="fixed">Fixed days</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="org-days" className="text-xs">Days/Week</Label>
                                    <Input
                                        id="org-days"
                                        name="daysPerWeek"
                                        type="number"
                                        min="0"
                                        max="7"
                                        defaultValue="1"
                                        className="mt-1"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="isMandatory" value="true" />
                                        Mandatory
                                    </label>
                                    <SubmitButton>Create</SubmitButton>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Per-user policies */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">Per-Employee Overrides</h4>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowNewForm(!showNewForm)}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Override
                        </Button>
                    </div>

                    {showNewForm && (
                        <form action={handleCreate} className="p-4 border rounded-lg space-y-3 bg-muted/20">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="new-employee" className="text-xs">Employee</Label>
                                    <select
                                        id="new-employee"
                                        name="profileId"
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                        required
                                    >
                                        <option value="">Select employee...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.first_name} {emp.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="new-policy-type" className="text-xs">Policy Type</Label>
                                    <select
                                        id="new-policy-type"
                                        name="policyType"
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                        value={policyType}
                                        onChange={(e) => setPolicyType(e.target.value as 'flexible' | 'fixed')}
                                    >
                                        <option value="flexible">Flexible (pick days each week)</option>
                                        <option value="fixed">Fixed days (same every week)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="new-days" className="text-xs">Days per Week</Label>
                                    <Input
                                        id="new-days"
                                        name="daysPerWeek"
                                        type="number"
                                        min="0"
                                        max="7"
                                        defaultValue="1"
                                        className="mt-1"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="isMandatory" value="true" />
                                        Mandatory (required, not optional)
                                    </label>
                                </div>
                            </div>

                            {policyType === 'fixed' && (
                                <div>
                                    <Label className="text-xs">Fixed Days</Label>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                        {DAYS_OF_WEEK.map(day => (
                                            <Button
                                                key={day.value}
                                                type="button"
                                                variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => toggleDay(day.value)}
                                            >
                                                {day.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <SubmitButton>Create Policy</SubmitButton>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}

                    {userPolicies.length > 0 ? (
                        <div className="space-y-2">
                            {userPolicies.map(policy => (
                                <div key={policy.id} className="p-3 border rounded-lg flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="font-medium text-sm">
                                            {policy.profiles?.first_name} {policy.profiles?.last_name}
                                        </span>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {policy.policy_type === 'flexible' ? 'Flexible' : 'Fixed'}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {policy.days_per_week} days/week
                                                {policy.fixed_days && ` (${policy.fixed_days.join(', ')})`}
                                            </span>
                                            {policy.is_mandatory && (
                                                <Badge variant="destructive" className="text-xs">Required</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <form action={handleDelete}>
                                        <input type="hidden" name="policyId" value={policy.id} />
                                        <SubmitButton variant="destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </SubmitButton>
                                    </form>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm text-center py-2">
                            No per-employee overrides configured.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
