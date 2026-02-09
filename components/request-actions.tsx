'use client'

import { Button } from '@/components/ui/button'
import { updateRequestStatus } from '@/actions/requests'
import { useTransition } from 'react'

interface RequestActionsProps {
    requestId: string
    currentStatus: string
    userRole: string
}

export function RequestActions({ requestId, currentStatus, userRole }: RequestActionsProps) {
    const [isPending, startTransition] = useTransition()

    if (currentStatus !== 'pending') {
        return null
    }

    // Only Managers, HR, and Admins can approve/reject
    if (!['manager', 'hr', 'admin'].includes(userRole)) {
        return null
    }

    const handleAction = (status: string) => {
        const formData = new FormData()
        formData.append('requestId', requestId)
        formData.append('status', status)
        formData.append('path', `/requests/${requestId}`)

        startTransition(async () => {
            await updateRequestStatus(formData)
        })
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={() => handleAction('approved')}
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
                {isPending ? 'Processing...' : 'Approve'}
            </Button>
            <Button
                onClick={() => handleAction('rejected')}
                variant="destructive"
                disabled={isPending}
            >
                {isPending ? 'Processing...' : 'Reject'}
            </Button>
        </div>
    )
}
