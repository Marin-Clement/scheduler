import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Plus, ListTodo } from 'lucide-react'

async function getRequests() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // If user is manager/hr/admin, they should see more requests.
    // For now, let's just show their own requests as per "My Requests" view.
    // We can enhance this later for other roles.

    const { data } = await supabase
        .from('leave_requests')
        .select(`
      *,
      leave_types ( name, code )
    `)
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })

    return data || []
}

export default async function RequestsPage() {
    const requests = await getRequests()

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">My Requests</h1>
                    <p className="text-muted-foreground mt-1">
                        Track and manage your leave requests.
                    </p>
                </div>
                <Link href="/requests/new" className={buttonVariants()}>
                    <Plus className="mr-2 h-4 w-4" /> New Request
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <ListTodo className="mr-2 h-5 w-5 text-muted-foreground" />
                        Request History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Type
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Dates
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {requests.length > 0 ? (
                                    requests.map((request: any) => (
                                        <tr key={request.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium">
                                                {request.leave_types?.name}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {new Date(request.start_date).toLocaleDateString()} ({request.start_half})
                                                <span className="mx-1">-</span>
                                                {new Date(request.end_date).toLocaleDateString()} ({request.end_half})
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge variant={
                                                    request.status === 'approved' ? 'success' :
                                                        request.status === 'rejected' ? 'destructive' : 'warning'
                                                }>
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Link
                                                    href={`/requests/${request.id}`}
                                                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-muted-foreground h-32">
                                            No requests found. Create a new one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
