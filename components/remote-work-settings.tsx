'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
    createRemoteWorkPolicy, 
    deleteRemoteWorkPolicy,
    applyPolicyToAllUsers 
} from '@/actions/remote-work'
import { useFormStatus } from 'react-dom'
import { Home, Trash2, Plus } from 'lucide-react'

const JOURS = [
    { value: 'monday', label: 'Lu' },
    { value: 'tuesday', label: 'Ma' },
    { value: 'wednesday', label: 'Me' },
    { value: 'thursday', label: 'Je' },
    { value: 'friday', label: 'Ve' },
]

interface Policy {
    id: string
    policy_type: 'flexible' | 'fixed'
    days_per_week: number
    fixed_days: string[] | null
    is_mandatory: boolean
    profile_id: string | null
    profiles?: { id: string; first_name: string; last_name: string } | null
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

function SubmitBtn({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'destructive' }) {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" size="sm" variant={variant} disabled={pending}>
            {pending ? '...' : children}
        </Button>
    )
}

export function RemoteWorkSettings({ policies, employees, orgId }: RemoteWorkSettingsProps) {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [showNew, setShowNew] = useState(false)
    const [policyType, setPolicyType] = useState<'flexible' | 'fixed'>('flexible')
    const [selectedDays, setSelectedDays] = useState<string[]>([])

    const orgPolicy = policies.find(p => !p.profile_id)
    const userPolicies = policies.filter(p => p.profile_id)

    async function handleCreate(formData: FormData) {
        formData.append('orgId', orgId)
        formData.append('path', '/hr')
        if (policyType === 'fixed') formData.append('fixedDays', selectedDays.join(','))
        const result = await createRemoteWorkPolicy(formData)
        if (result.error) setMessage({ type: 'error', text: result.error })
        else { setMessage({ type: 'success', text: 'Créé' }); setShowNew(false); setSelectedDays([]) }
        setTimeout(() => setMessage(null), 3000)
    }

    async function handleDelete(formData: FormData) {
        formData.append('path', '/hr')
        const result = await deleteRemoteWorkPolicy(formData)
        if (result.error) setMessage({ type: 'error', text: result.error })
        else setMessage({ type: 'success', text: 'Supprimé' })
        setTimeout(() => setMessage(null), 3000)
    }

    async function handleApplyAll(formData: FormData) {
        formData.append('orgId', orgId)
        formData.append('path', '/hr')
        const result = await applyPolicyToAllUsers(formData)
        if (result.error) setMessage({ type: 'error', text: result.error })
        else setMessage({ type: 'success', text: 'Appliqué' })
        setTimeout(() => setMessage(null), 3000)
    }

    function toggleDay(day: string) {
        setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Home className="h-4 w-4" />
                    Télétravail
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {message && (
                    <div className={`p-2 rounded-md text-sm ${
                        message.type === 'success' 
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' 
                            : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Politique par défaut */}
                <div className="space-y-2">
                    <Text variant="small" className="font-medium">Politique par défaut</Text>
                    {orgPolicy ? (
                        <div className="flex items-center justify-between p-2 border border-border rounded-md bg-muted/50">
                            <div className="flex gap-2 items-center">
                                <Badge variant={orgPolicy.policy_type === 'flexible' ? 'default' : 'secondary'} className="text-xs">
                                    {orgPolicy.policy_type === 'flexible' ? 'Flexible' : 'Fixe'}
                                </Badge>
                                <Text variant="muted" className="text-xs">
                                    {orgPolicy.days_per_week}j/sem
                                    {orgPolicy.is_mandatory && ' (obligatoire)'}
                                </Text>
                            </div>
                            <form action={handleDelete}>
                                <input type="hidden" name="policyId" value={orgPolicy.id} />
                                <SubmitBtn variant="destructive"><Trash2 className="h-3 w-3" /></SubmitBtn>
                            </form>
                        </div>
                    ) : (
                        <form action={handleApplyAll} className="p-3 border border-border rounded-md space-y-2 bg-card">
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <Label className="text-xs">Type</Label>
                                    <Select name="policyType" className="h-8 text-sm mt-1">
                                        <option value="flexible">Flexible</option>
                                        <option value="fixed">Fixe</option>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs">Jours/sem</Label>
                                    <Input name="daysPerWeek" type="number" min="0" max="5" defaultValue="1" className="h-8 text-sm mt-1" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <div className="flex items-center gap-1">
                                        <Checkbox name="isMandatory" value="true" />
                                        <Label className="text-xs">Oblig.</Label>
                                    </div>
                                    <SubmitBtn>Créer</SubmitBtn>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Par employé */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Text variant="small" className="font-medium">Par employé</Text>
                        <Button variant="ghost" size="sm" onClick={() => setShowNew(!showNew)}>
                            <Plus className="h-3 w-3 mr-1" />{showNew ? 'Annuler' : 'Ajouter'}
                        </Button>
                    </div>

                    {showNew && (
                        <form action={handleCreate} className="p-3 border border-border rounded-md space-y-2 bg-muted/30">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Employé</Label>
                                    <Select name="profileId" required className="h-8 text-sm mt-1">
                                        <option value="">Choisir...</option>
                                        {employees.map(e => (
                                            <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs">Type</Label>
                                    <Select 
                                        name="policyType" 
                                        value={policyType} 
                                        onChange={e => setPolicyType(e.target.value as 'flexible' | 'fixed')}
                                        className="h-8 text-sm mt-1"
                                    >
                                        <option value="flexible">Flexible</option>
                                        <option value="fixed">Fixe</option>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Jours/sem</Label>
                                    <Input name="daysPerWeek" type="number" min="0" max="5" defaultValue="1" className="h-8 text-sm mt-1" />
                                </div>
                                <div className="flex items-center gap-2 pt-5">
                                    <Checkbox name="isMandatory" value="true" />
                                    <Label className="text-xs">Obligatoire</Label>
                                </div>
                            </div>
                            {policyType === 'fixed' && (
                                <div className="flex gap-1">
                                    {JOURS.map(d => (
                                        <Button
                                            key={d.value}
                                            type="button"
                                            size="sm"
                                            variant={selectedDays.includes(d.value) ? 'default' : 'outline'}
                                            className="h-7 px-2 text-xs"
                                            onClick={() => toggleDay(d.value)}
                                        >
                                            {d.label}
                                        </Button>
                                    ))}
                                </div>
                            )}
                            <SubmitBtn>Créer</SubmitBtn>
                        </form>
                    )}

                    {userPolicies.length > 0 ? (
                        <div className="space-y-1">
                            {userPolicies.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-2 border border-border rounded-md bg-card">
                                    <div>
                                        <Text variant="small">{p.profiles?.first_name} {p.profiles?.last_name}</Text>
                                        <div className="flex gap-1 mt-0.5">
                                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                {p.policy_type === 'flexible' ? 'Flex' : 'Fixe'}
                                            </Badge>
                                            <Text variant="muted" className="text-[10px]">
                                                {p.days_per_week}j {p.fixed_days?.join(', ')}
                                            </Text>
                                        </div>
                                    </div>
                                    <form action={handleDelete}>
                                        <input type="hidden" name="policyId" value={p.id} />
                                        <SubmitBtn variant="destructive"><Trash2 className="h-3 w-3" /></SubmitBtn>
                                    </form>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Text variant="muted" className="text-xs">Aucune exception configurée</Text>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
