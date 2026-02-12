import { createClient } from '@/utils/supabase/server'
import RequestForm from './request-form'

async function getLeaveTypes() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Ideally we should filter by the user's contract type if applicable
    // For now, fetching all leave types for the org
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile) {
        console.error('getLeaveTypes: No profile found for user', user.id)
        return []
    }

    console.log('getLeaveTypes: Profile found, org_id:', profile.org_id)

    // Debug: Check what the DB thinks the org ID is via the function
    const { data: dbOrgId, error: rpcError } = await supabase.rpc('get_my_org_id')
    console.log('getLeaveTypes: DB Function get_my_org_id returned:', dbOrgId, 'Error:', rpcError)

    const { data, error } = await supabase
        .from('leave_types')
        .select('*')
    // Try removing the filter temporarily to see if RLS works at all (it should filter by itself)
    // .eq('org_id', profile.org_id) 
    // Keeping it is fine, but if RLS matches, it matches.

    if (error) {
        console.error('getLeaveTypes: Error fetching leave types:', error)
    } else {
        console.log('getLeaveTypes: Fetched types:', data)
    }

    return data || []
}

export default async function NewRequestPage() {
    const leaveTypes = await getLeaveTypes()

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">New Leave Request</h1>
            <RequestForm leaveTypes={leaveTypes} />
        </div>
    )
}
