import { getTeamMembers, getTeamRequests, getUser } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Briefcase, Calendar } from 'lucide-react'

export default async function TeamPage() {
    const user = await getUser()
    if (!user) {
        redirect('/login')
    }

    const members = await getTeamMembers(user.id)
    const requests = await getTeamRequests(user.id)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Helper to check if a member is currently on leave
    const getMemberStatus = (memberId: string) => {
        const activeLeave = requests.find((req: any) => {
            if (req.profile_id !== memberId || req.status !== 'approved') return false
            const start = new Date(req.start_date)
            const end = new Date(req.end_date)
            return today >= start && today <= end
        })

        if (activeLeave) {
            return {
                status: 'On Leave',
                variant: 'warning',
                details: `Until ${new Date(activeLeave.end_date).toLocaleDateString()}`
            }
        }
        return { status: 'Working', variant: 'success', details: 'Available' }
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Text variant="h2">My Team</Text>
                <Text variant="lead">Manage and view your team members.</Text>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {members.length > 0 ? (
                    members.map((member: any) => {
                        const status = getMemberStatus(member.id)
                        return (
                            <Card key={member.id} className="overflow-hidden">
                                <CardHeader className="flex flex-row items-center gap-4 bg-muted/40 p-6">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="grid gap-1">
                                        <CardTitle className="text-lg">
                                            {member.first_name} {member.last_name}
                                        </CardTitle>
                                        <Text variant="muted" className="text-xs">{member.role?.toUpperCase()}</Text>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 grid gap-4">
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{member.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                                            <span>{member.role || 'Employee'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Status:</span>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={status.variant as any}>
                                                {status.status}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {status.details}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                ) : (
                    <div className="col-span-full text-center p-12 bg-muted/20 rounded-lg border border-dashed">
                        <Text variant="lead">No team members found.</Text>
                        <Text variant="muted">You typically see your colleagues here.</Text>
                    </div>
                )}
            </div>
        </div>
    )
}
