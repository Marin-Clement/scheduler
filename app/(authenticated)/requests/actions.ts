'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

    const leaveTypeId = formData.get('leave_type_id') as string
    const startDate = formData.get('start_date') as string
    const startHalf = formData.get('start_half') as string
    const endDate = formData.get('end_date') as string
    const endHalf = formData.get('end_half') as string
    const subject = formData.get('subject') as string

    const { error } = await supabase.from('leave_requests').insert({
        org_id: profile.org_id,
        profile_id: user.id,
        leave_type_id: leaveTypeId,
        start_date: startDate,
        start_half: startHalf,
        end_date: endDate,
        end_half: endHalf,
        subject: subject,
        status: 'pending',
    })

    if (error) {
        console.error('Error creating request:', error)
        throw new Error('Failed to create request')
    }

    revalidatePath('/dashboard')
    revalidatePath('/requests')
    redirect('/dashboard')
}
