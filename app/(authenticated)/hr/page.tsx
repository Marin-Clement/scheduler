import { getAllEmployeesWithBalances, getLeaveTypes, getUser, getProfile, getRemoteWorkPolicies, getOrgLeaveSettings } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AddBalanceDialog } from '@/components/add-balance-dialog'
import { EmployeeBalancesCell } from '@/components/employee-balances-cell'
import { LeaveAccrualSettings } from '@/components/leave-accrual-settings'
import { RemoteWorkSettings } from '@/components/remote-work-settings'
import { HrRequestsList } from '@/components/hr-requests-list'

export default async function HRPage() {
    const user = await getUser()
    if (!user) {
        redirect('/login')
    }

    const currentUserProfile = await getProfile(user.id)
    if (!['hr', 'admin'].includes(currentUserProfile?.role || '')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Text variant="h2">Accès refusé</Text>
                <Text variant="muted">Vous n'avez pas la permission de voir cette page.</Text>
                <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
                    Retour au tableau de bord
                </Link>
            </div>
        )
    }

    const [employees, leaveTypes, leaveSettings, remotePolicies] = await Promise.all([
        getAllEmployeesWithBalances(currentUserProfile.org_id),
        getLeaveTypes(currentUserProfile.org_id),
        getOrgLeaveSettings(currentUserProfile.org_id),
        getRemoteWorkPolicies(currentUserProfile.org_id)
    ])

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Text variant="h2">Gestion RH</Text>
                <Text variant="lead">Gérez les employés, les soldes de congés et les demandes.</Text>
            </div>

            <HrRequestsList orgId={currentUserProfile.org_id} userRole={currentUserProfile.role} />

            <Card>
                <CardHeader>
                    <CardTitle>Annuaire des employés ({employees.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employé</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Soldes</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map((employee: any) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                {employee.first_name?.[0]}{employee.last_name?.[0]}
                                            </div>
                                            <div>
                                                <div>{employee.first_name} {employee.last_name}</div>
                                                <div className="text-xs text-muted-foreground">{employee.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{employee.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <EmployeeBalancesCell balances={employee.balances || []} />
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={employee.is_active ? 'success' : 'secondary'}>
                                            {employee.is_active ? 'Actif' : 'Inactif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AddBalanceDialog
                                            profileId={employee.id}
                                            profileName={`${employee.first_name} ${employee.last_name}`}
                                            leaveTypes={leaveTypes}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <LeaveAccrualSettings 
                    leaveTypes={leaveSettings} 
                    orgId={currentUserProfile.org_id} 
                />
                <RemoteWorkSettings 
                    policies={remotePolicies} 
                    employees={employees}
                    orgId={currentUserProfile.org_id} 
                />
            </div>
        </div>
    )
}
