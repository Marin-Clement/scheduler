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
