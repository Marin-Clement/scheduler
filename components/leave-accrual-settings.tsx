'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import { updateDefaultMonthlyIncrement, bulkUpdateMonthlyIncrement } from '@/actions/balances'
import { useFormStatus } from 'react-dom'
import { Settings, Users, Check } from 'lucide-react'

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
            {pending ? '...' : children}
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
            setMessage({ type: 'success', text: 'Défaut mis à jour' })
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
            setMessage({ type: 'success', text: 'Appliqué à tous les employés' })
        }
        setTimeout(() => setMessage(null), 3000)
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-4 w-4" />
                    Cumul mensuel des congés
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {message && (
                    <div className={`p-2 rounded-md text-sm ${
                        message.type === 'success' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                        {message.text}
                    </div>
                )}

                {leaveTypes.length === 0 ? (
                    <Text variant="muted">Aucun type de congé configuré.</Text>
                ) : (
                    <div className="space-y-4">
                        {leaveTypes.map((leaveType) => (
                            <div key={leaveType.id} className="p-4 border border-border rounded-lg bg-white">
                                {/* Header with name and current value */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: leaveType.color }}
                                        />
                                        <span className="font-medium">{leaveType.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {leaveType.code}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded text-primary font-semibold text-sm">
                                        <Check className="h-3 w-3" />
                                        {leaveType.default_monthly_increment ?? 0} j/mois
                                    </div>
                                </div>

                                {/* Forms */}
                                <div className="grid grid-cols-2 gap-3">
                                    <form action={handleDefaultUpdate} className="space-y-1">
                                        <input type="hidden" name="leaveTypeId" value={leaveType.id} />
                                        <Label className="text-xs text-muted-foreground">
                                            Modifier le défaut mensuel
                                        </Label>
                                        <div className="flex gap-1">
                                            <Input
                                                name="increment"
                                                type="number"
                                                step="0.25"
                                                min="0"
                                                placeholder={String(leaveType.default_monthly_increment ?? 0)}
                                                className="h-8 text-sm"
                                            />
                                            <SubmitButton>OK</SubmitButton>
                                        </div>
                                    </form>

                                    <form action={handleBulkUpdate} className="space-y-1">
                                        <input type="hidden" name="leaveTypeId" value={leaveType.id} />
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Users className="h-3 w-3" /> Appliquer à tous
                                        </Label>
                                        <div className="flex gap-1">
                                            <Input
                                                name="increment"
                                                type="number"
                                                step="0.25"
                                                min="0"
                                                placeholder="Jours"
                                                className="h-8 text-sm"
                                            />
                                            <SubmitButton>OK</SubmitButton>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
