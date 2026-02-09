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

export async function updateMonthlyIncrement(formData: FormData) {
    const profileId = formData.get('profileId') as string
    const leaveTypeId = formData.get('leaveTypeId') as string
    const increment = parseFloat(formData.get('increment') as string)
    const path = formData.get('path') as string

    if (!profileId || !leaveTypeId || isNaN(increment)) {
        return { error: 'Invalid input' }
    }

    const supabase = await createClient()

    // Update or create the balance record with monthly_increment
    const { data: existingBalance } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('profile_id', profileId)
        .eq('leave_type_id', leaveTypeId)
        .single()

    let error
    if (existingBalance) {
        const { error: updateError } = await supabase
            .from('leave_balances')
            .update({
                monthly_increment: increment,
                updated_at: new Date().toISOString()
            })
            .eq('id', existingBalance.id)
        error = updateError
    } else {
        // Need to create balance record first
        const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', profileId).single()

        if (profile) {
            const { error: insertError } = await supabase
                .from('leave_balances')
                .insert({
                    profile_id: profileId,
                    leave_type_id: leaveTypeId,
                    balance: 0,
                    monthly_increment: increment,
                    org_id: profile.org_id
                })
            error = insertError
        } else {
            return { error: 'Profile not found' }
        }
    }

    if (error) {
        console.error('Error updating monthly increment:', error)
        return { error: 'Failed to update monthly increment' }
    }

    revalidatePath(path)
    return { success: true }
}

export async function updateDefaultMonthlyIncrement(formData: FormData) {
    const leaveTypeId = formData.get('leaveTypeId') as string
    const increment = parseFloat(formData.get('increment') as string)
    const path = formData.get('path') as string

    if (!leaveTypeId || isNaN(increment)) {
        return { error: 'Invalid input' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('leave_types')
        .update({
            default_monthly_increment: increment,
            updated_at: new Date().toISOString()
        })
        .eq('id', leaveTypeId)

    if (error) {
        console.error('Error updating default increment:', error)
        return { error: 'Failed to update default increment' }
    }

    revalidatePath(path)
    return { success: true }
}

export async function bulkUpdateMonthlyIncrement(formData: FormData) {
    const orgId = formData.get('orgId') as string
    const leaveTypeId = formData.get('leaveTypeId') as string
    const increment = parseFloat(formData.get('increment') as string)
    const path = formData.get('path') as string

    if (!orgId || !leaveTypeId || isNaN(increment)) {
        return { error: 'Invalid input' }
    }

    const supabase = await createClient()

    // Get all profiles in the org
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('org_id', orgId)

    if (!profiles || profiles.length === 0) {
        return { error: 'No profiles found' }
    }

    // For each profile, update or create balance record
    for (const profile of profiles) {
        const { data: existingBalance } = await supabase
            .from('leave_balances')
            .select('id')
            .eq('profile_id', profile.id)
            .eq('leave_type_id', leaveTypeId)
            .single()

        if (existingBalance) {
            await supabase
                .from('leave_balances')
                .update({ monthly_increment: increment })
                .eq('id', existingBalance.id)
        } else {
            await supabase
                .from('leave_balances')
                .insert({
                    profile_id: profile.id,
                    leave_type_id: leaveTypeId,
                    balance: 0,
                    monthly_increment: increment,
                    org_id: orgId
                })
        }
    }

    revalidatePath(path)
    return { success: true }
}

