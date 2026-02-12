'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { LeaveRequestItem } from '@/components/ui/date-range-picker'

export async function createLeaveRequest(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile to get org_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single()

    if (!profile) {
        throw new Error('Profile not found')
    }

    const requestDataRaw = formData.get('request_data') as string
    const subject = formData.get('subject') as string

    if (!requestDataRaw) {
        // Fallback for old clients or errors? Or just throw.
        throw new Error('No request data submitted')
    }

    let requests: LeaveRequestItem[] = []
    try {
        requests = JSON.parse(requestDataRaw)
    } catch (e) {
        console.error('Failed to parse request data', e)
        throw new Error('Invalid request data')
    }

    if (requests.length === 0) {
        throw new Error('No requests selected')
    }

    // Prepare rows for insertion
    const rows = requests.map(req => {
        // Ensure we have Date objects (JSON.parse gives strings)
        const fromDate = new Date(req.range.from!)
        const toDate = req.range.to ? new Date(req.range.to) : fromDate

        return {
            org_id: profile.org_id,
            profile_id: user.id,
            leave_type_id: req.type, // This is now the UUID
            start_date: fromDate.toISOString().split('T')[0],
            start_half: req.range.fromHalfDay ? 'PM' : 'AM',
            end_date: toDate.toISOString().split('T')[0],
            end_half: req.range.toHalfDay ? 'AM' : 'PM',
            subject: subject,
            status: 'pending',
        }
    })

    const { error } = await supabase.from('leave_requests').insert(rows)

    if (error) {
        console.error('Error creating requests:', error)
        throw new Error('Failed to create requests')
    }

    revalidatePath('/dashboard')
    revalidatePath('/requests')
    redirect('/dashboard')
}
