import { getRequest, getUser, getProfile } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, FileText, Clock } from 'lucide-react'
import { RequestActions } from '@/components/request-actions'

export default async function RequestDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const user = await getUser()
    if (!user) {
        redirect('/login')
    }

    const request = await getRequest(id)
    const currentUserProfile = await getProfile(user.id)

    if (!request) {
        return (
            <div className="max-w-2xl mx-auto mt-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Request Not Found</h1>
                <p className="mt-2 text-muted-foreground">The request you are looking for does not exist or you do not have permission to view it.</p>
                <Link href="/requests" className={buttonVariants() + " mt-6"}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Requests
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Request Details
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        View full details of the leave request.
                    </p>
                </div>
                <Link href="/requests" className={buttonVariants({ variant: "outline" })}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Link>
            </div>

            <Card>
                <CardHeader className="border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: request.leave_types?.color || '#3B82F6' }}>
                                {request.leave_types?.name?.charAt(0) || 'L'}
                            </div>
                            <div>
                                <CardTitle className="text-lg">
                                    {request.leave_types?.name || 'Leave Request'}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    ID: {request.id.slice(0, 8)}...
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <RequestActions
                                requestId={request.id}
                                currentStatus={request.status}
                                userRole={currentUserProfile?.role || 'employee'}
                            />
                            <Badge variant={
                                request.status === 'approved' ? 'success' :
                                    request.status === 'rejected' ? 'destructive' : 'warning'
                            } className="text-sm px-3 py-1">
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 py-6 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4" /> Requester
                            </label>
                            <p className="text-base font-medium text-foreground">
                                {request.profiles?.first_name} {request.profiles?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {request.profiles?.email}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Dates
                            </label>
                            <p className="text-base font-medium text-foreground">
                                {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {request.start_half} start - {request.end_half} end
                            </p>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Subject / Reason
                            </label>
                            <div className="mt-1 p-3 bg-muted/50 rounded-md border border-border text-sm text-foreground">
                                {request.subject || 'No subject provided.'}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Submitted On
                            </label>
                            <p className="text-sm text-foreground">
                                {new Date(request.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}
