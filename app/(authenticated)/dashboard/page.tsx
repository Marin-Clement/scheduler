import { getBalances, getMyRequests, getProfile, getUser } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, ArrowRight, LayoutDashboard } from 'lucide-react'

export default async function DashboardPage() {
    const user = await getUser()
    if (!user) {
        redirect('/login')
    }

    const profile = await getProfile(user.id)
    const balances = await getBalances(user.id)
    const requests = await getMyRequests(user.id)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, check your leave status.</p>
                </div>
                <Button asChild>
                    <Link href="/requests/new">
                        <Plus className="mr-2 h-4 w-4" /> New Request
                    </Link>
                </Button>
            </div>

            {!profile && (
                <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <LayoutDashboard className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Profile Pending</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                    Your profile is not yet fully initialized. Please contact HR or wait for the system to process your account.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Balances Section */}
            <div>
                <h2 className="text-lg font-semibold mb-4 text-foreground">Your Balances</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {balances.length > 0 ? (
                        balances.map((balance: any) => (
                            <Card key={balance.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: balance.leave_types.color || '#3B82F6' }}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {balance.leave_types.name}
                                    </CardTitle>
                                    <div
                                        className="h-4 w-4 rounded-full opacity-50"
                                        style={{ backgroundColor: balance.leave_types.color || '#3B82F6' }}
                                    />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{balance.balance} <span className="text-sm font-normal text-muted-foreground">days</span></div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="col-span-4 border-dashed bg-muted/50">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                                <p>No active balances found.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Recent Requests Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Recent Requests</h2>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/requests" className="text-muted-foreground">
                            View all <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <Card>
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
                                                {request.leave_types?.name || 'Leave'}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
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
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/requests/${request.id}`}>View</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-muted-foreground h-24">
                                            No recent requests.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    )
}
