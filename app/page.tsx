import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }

  // Fallback (won't be reached usually due to redirects)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Scheduler</h1>
        <p className="text-gray-600 mb-8">Redirecting...</p>
      </div>
    </div>
  )
}
