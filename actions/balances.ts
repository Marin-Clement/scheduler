'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addBalance(formData: FormData) {
    const profileId = formData.get('profileId') as string
    const leaveTypeId = formData.get('leaveTypeId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const path = formData.get('path') as string

    if (!profileId || !leaveTypeId || isNaN(amount)) {
        return { error: 'Invalid input' }
    }

    const supabase = await createClient()

    // First check if balance exists
    const { data: existingBalance } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('profile_id', profileId)
        .eq('leave_type_id', leaveTypeId)
        .single()

    let error
    if (existingBalance) {
        // Update existing
        const { error: updateError } = await supabase
            .from('leave_balances')
            .update({
                balance: existingBalance.balance + amount,
                updated_at: new Date().toISOString()
            })
            .eq('id', existingBalance.id)
        error = updateError
    } else {
        // Insert new (need org_id)
        const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', profileId).single()

        if (profile) {
            const { error: insertError } = await supabase
                .from('leave_balances')
                .insert({
                    profile_id: profileId,
                    leave_type_id: leaveTypeId,
                    balance: amount,
                    org_id: profile.org_id
                })
            error = insertError
        } else {
            return { error: 'Profile not found' }
        }
    }

    if (error) {
        console.error('Error updating balance:', error)
        return { error: 'Failed to update balance' }
    }

    revalidatePath(path)
    return { success: true }
}
