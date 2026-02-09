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

    async function onSubmit(formData: FormData) {
        const res = await addBalance(formData)
        if (res?.success) {
            setOpen(false)
        } else {
            // Handle error (could add toast here)
            console.error(res?.error)
        }
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        formData.append('profileId', profileId)
        formData.append('path', '/hr') // Revalidate HR page

        startTransition(async () => {
            await onSubmit(formData)
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Balance
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Leave Balance</DialogTitle>
                    <DialogDescription>
                        Add balance days for {profileName}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="leaveTypeId">Leave Type</Label>
                        <Select name="leaveTypeId" required>
                            <option value="" disabled selected>Select a leave type</option>
                            {leaveTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount (Days)</Label>
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
                            {isPending ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
