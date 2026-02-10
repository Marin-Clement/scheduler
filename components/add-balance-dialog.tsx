'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { addBalance } from '@/actions/balances'
import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'

interface AddBalanceDialogProps {
    profileId: string
    profileName: string
    leaveTypes: any[]
}

export function AddBalanceDialog({ profileId, profileName, leaveTypes }: AddBalanceDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(formData: FormData) {
        const res = await addBalance(formData)
        if (res?.success) {
            setOpen(false)
            setError(null)
        } else {
            setError(res?.error || 'Erreur inconnue')
        }
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        formData.append('profileId', profileId)
        formData.append('path', '/hr')

        startTransition(async () => {
            await onSubmit(formData)
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Ajouter
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajouter des jours de congé</DialogTitle>
                    <DialogDescription>
                        Ajouter des jours de congé pour {profileName}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {error && (
                        <div className="p-2 rounded-md text-sm bg-destructive/10 text-destructive border border-destructive/20">
                            {error}
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="leaveTypeId">Type de congé</Label>
                        <Select name="leaveTypeId" required>
                            <option value="" disabled>Sélectionner un type</option>
                            {leaveTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Nombre de jours</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.5"
                            defaultValue="1"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
