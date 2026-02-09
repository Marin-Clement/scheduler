import { getAllOrganizationRequests } from '@/utils/supabase/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { RequestActions } from '@/components/request-actions'
import { Text } from '@/components/ui/text'

export async function HrRequestsList({ orgId, userRole }: { orgId: string, userRole: string }) {
    const requests = await getAllOrganizationRequests(orgId, 'pending')

    if (requests.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Text variant="muted">No pending requests found.</Text>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Requests ({requests.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Leave Type</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request: any) => (
                            <TableRow key={request.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{request.profiles.first_name} {request.profiles.last_name}</span>
                                        <span className="text-xs text-muted-foreground">{request.profiles.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        style={{
                                            borderColor: request.leave_types?.color,
                                            color: request.leave_types?.color,
                                            backgroundColor: request.leave_types?.color ? `${request.leave_types.color}10` : 'transparent'
                                        }}
                                    >
                                        {request.leave_types?.name}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {request.start_half} - {request.end_half}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {/* Duration calculation could be complex, omitting for now or adding helper if needed */}
                                    -
                                </TableCell>
                                <TableCell className="text-right">
                                    <RequestActions
                                        requestId={request.id}
                                        currentStatus={request.status}
                                        userRole={userRole}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
