'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type PolicyType = 'flexible' | 'fixed'
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export async function createRemoteWorkPolicy(formData: FormData) {
    const orgId = formData.get('orgId') as string
    const profileId = formData.get('profileId') as string | null
    const policyType = formData.get('policyType') as PolicyType
    const daysPerWeek = parseInt(formData.get('daysPerWeek') as string)
    const fixedDaysRaw = formData.get('fixedDays') as string | null
    const isMandatory = formData.get('isMandatory') === 'true'
    const path = formData.get('path') as string

    if (!orgId || !policyType || isNaN(daysPerWeek)) {
        return { error: 'Invalid input' }
    }

    const fixedDays = fixedDaysRaw ? fixedDaysRaw.split(',').filter(Boolean) : null

    const supabase = await createClient()

    const { error } = await supabase
        .from('remote_work_policies')
        .insert({
            org_id: orgId,
            profile_id: profileId || null,
            policy_type: policyType,
            days_per_week: daysPerWeek,
            fixed_days: fixedDays,
            is_mandatory: isMandatory
        })

    if (error) {
        console.error('Error creating remote work policy:', error)
        return { error: 'Failed to create policy' }
    }

    revalidatePath(path)
    return { success: true }
}

export async function updateRemoteWorkPolicy(formData: FormData) {
    const policyId = formData.get('policyId') as string
    const policyType = formData.get('policyType') as PolicyType | null
    const daysPerWeek = formData.get('daysPerWeek') as string | null
    const fixedDaysRaw = formData.get('fixedDays') as string | null
    const isMandatory = formData.get('isMandatory') as string | null
    const path = formData.get('path') as string

    if (!policyId) {
        return { error: 'Policy ID required' }
    }

    const supabase = await createClient()

    const updates: any = { updated_at: new Date().toISOString() }
    if (policyType) updates.policy_type = policyType
    if (daysPerWeek) updates.days_per_week = parseInt(daysPerWeek)
    if (fixedDaysRaw !== null) updates.fixed_days = fixedDaysRaw ? fixedDaysRaw.split(',').filter(Boolean) : null
    if (isMandatory !== null) updates.is_mandatory = isMandatory === 'true'

    const { error } = await supabase
        .from('remote_work_policies')
        .update(updates)
        .eq('id', policyId)

    if (error) {
        console.error('Error updating remote work policy:', error)
        return { error: 'Failed to update policy' }
    }

    revalidatePath(path)
    return { success: true }
}

export async function deleteRemoteWorkPolicy(formData: FormData) {
    const policyId = formData.get('policyId') as string
    const path = formData.get('path') as string

    if (!policyId) {
        return { error: 'Policy ID required' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('remote_work_policies')
        .delete()
        .eq('id', policyId)

    if (error) {
        console.error('Error deleting remote work policy:', error)
        return { error: 'Failed to delete policy' }
    }

    revalidatePath(path)
    return { success: true }
}

export async function applyPolicyToAllUsers(formData: FormData) {
    const orgId = formData.get('orgId') as string
    const policyType = formData.get('policyType') as PolicyType
    const daysPerWeek = parseInt(formData.get('daysPerWeek') as string)
    const fixedDaysRaw = formData.get('fixedDays') as string | null
    const isMandatory = formData.get('isMandatory') === 'true'
    const path = formData.get('path') as string

    if (!orgId || !policyType || isNaN(daysPerWeek)) {
        return { error: 'Invalid input' }
    }

    const fixedDays = fixedDaysRaw ? fixedDaysRaw.split(',').filter(Boolean) : null

    const supabase = await createClient()

    // First, delete any existing org-wide default policy (profile_id = null)
    await supabase
        .from('remote_work_policies')
        .delete()
        .eq('org_id', orgId)
        .is('profile_id', null)

    // Create new org-wide default
    const { error } = await supabase
        .from('remote_work_policies')
        .insert({
            org_id: orgId,
            profile_id: null,
            policy_type: policyType,
            days_per_week: daysPerWeek,
            fixed_days: fixedDays,
            is_mandatory: isMandatory
        })

    if (error) {
        console.error('Error applying policy to all users:', error)
        return { error: 'Failed to apply policy' }
    }

    revalidatePath(path)
    return { success: true }
}
