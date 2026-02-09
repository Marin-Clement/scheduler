import { createClient } from './server'
import { cache } from 'react'

export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
  }

  return data
})

export const getBalances = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leave_balances')
    .select(`
      *,
      leave_types (
        name,
        code,
        color
      )
    `)
    .eq('profile_id', userId)

  return data || []
})

export const getMyRequests = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leave_requests')
    .select(`
      *,
      leave_types (
        name,
        code
      )
    `)
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  return data || []
})

export const getRequest = cache(async (requestId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leave_requests')
    .select(`
      *,
      leave_types (
        name,
        code
      ),
      profiles!leave_requests_profile_id_fkey (
        first_name,
        last_name,
        email
      )
    `)
    .eq('id', requestId)
    .single()

  if (error) {
    console.error('Error fetching request:', error)
  }

  return data
})

export const getTeamMembers = cache(async (userId: string) => {
  const supabase = await createClient()

  // First get the user's profile to know their team/org
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, team_id')
    .eq('id', userId)
    .single()

  if (!profile) return []

  // Then fetch colleagues
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('org_id', profile.org_id)
    .neq('id', userId) // Exclude self if desired, or keep it. Let's keep it to show whole team.

  if (profile.team_id) {
    query = query.eq('team_id', profile.team_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }

  return data
})

export const getTeamRequests = cache(async (userId: string) => {
  const supabase = await createClient()

  // Get user's context
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, team_id')
    .eq('id', userId)
    .single()

  if (!profile) return []

  // Fetch requests for the team
  // We need to filter by profiles in the same team. 
  // This might involve a join or a second query. 
  // Optimization: Fetch team IDs first or use a join if RLS allows.
  // Given RLS usually filters by org/team, we might just be able to query leave_requests directly if policies allow reading co-workers.
  // Assuming 'leave_requests' RLS allows reading rows where user is in same org/team.

  const { data, error } = await supabase
    .from('leave_requests')
    .select(`
      *,
      leave_types (
        name,
        code,
        color
      ),
      profiles!leave_requests_profile_id_fkey (
        id,
        first_name,
        last_name,
        email,
        team_id,
        org_id
      )
    `)
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error fetching team requests:', error)
    return []
  }

  // Filter in memory for simplicity if RLS is broad, or rely on RLS.
  // Let's rely on RLS to return what the user is allowed to see (usually their org/team).
  // But to be safe and specific to "Team View":
  const teamRequests = data.filter((req: any) => {
    // If user has a team_id, strict filter by team. If not (e.g. admin/CEO), maybe show all org?
    // Let's stick to strict team match if team_id exists.
    if (profile.team_id) {
      return req.profiles.team_id === profile.team_id
    }
    return req.profiles.org_id === profile.org_id
  })

  return teamRequests
})

export const getAllEmployees = cache(async (orgId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('org_id', orgId)
    .order('last_name', { ascending: true })

  if (error) {
    console.error('Error fetching employees:', error)
    return []
  }
  return data
})

export const getLeaveTypes = cache(async (orgId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leave_types')
    .select('*')
    .eq('org_id', orgId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching leave types:', error)
    return []
  }
  return data
})
