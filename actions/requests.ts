'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateRequestStatus(formData: FormData) {
    const requestId = formData.get('requestId') as string
    const newStatus = formData.get('status') as string
    const path = formData.get('path') as string

    if (!requestId || !newStatus) {
        return { error: 'Invalid request' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('leave_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId)

    if (error) {
        console.error('Error updating request:', error)
        return { error: 'Failed to update request' }
    }

    revalidatePath(path)
    return { success: true }
}
