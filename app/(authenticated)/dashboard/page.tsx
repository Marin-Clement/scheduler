import {
    getBalances,
    getMyRequests,
    getProfile,
    getUser,
} from "@/utils/supabase/queries"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Plus, ArrowRight, LayoutDashboard } from "lucide-react"

type DashboardBalance = {
    id: string
    balance: number
    monthly_increment?: number | null
    leave_types: {
        name: string
        code?: string | null
        color?: string | null
        default_monthly_increment?: number | null
    }
}

type RecentRequest = {
    id: string
    status: string
    start_date: string
    end_date: string
    leave_types?: {
        name?: string | null
    } | null
}

type LeaveCategory = "paid" | "unpaid" | "remote" | "sickness" | "other"

function stripAccents(value: string) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function getLeaveCategory(
    name?: string | null,
    code?: string | null,
): LeaveCategory {
    const source = stripAccents(`${code ?? ""} ${name ?? ""}`.toLowerCase())
    if (source.includes("sick") || source.includes("maladi")) return "sickness"
    if (
        source.includes("unpaid") ||
        source.includes("sans") ||
        source.includes("solde")
    )
        return "unpaid"
    if (
        source.includes("remote") ||
        source.includes("tele") ||
        source.includes("tt")
    )
        return "remote"
    if (
        source.includes("paid") ||
        source.includes("conge") ||
        source.includes("cp")
    )
        return "paid"
    return "other"
}

function getAnnualLimit(
    balance: DashboardBalance,
    category: LeaveCategory,
): number | null {
    const monthlyFromBalance = Number(balance.monthly_increment ?? 0)
    const monthlyFromType = Number(
        balance.leave_types.default_monthly_increment ?? 0,
    )
    const monthlyRate =
        monthlyFromBalance > 0 ? monthlyFromBalance : monthlyFromType

    if (category === "paid") {
        return monthlyRate > 0 ? monthlyRate * 12 : 25
    }

    if (category === "remote") {
        return monthlyRate > 0 ? monthlyRate * 12 : null
    }

    if (category === "unpaid" || category === "sickness") {
        return null
    }

    return monthlyRate > 0 ? monthlyRate * 12 : null
}

export default async function DashboardPage() {
    const user = await getUser()
    if (!user) {
        redirect("/login")
    }

    const profile = await getProfile(user.id)
    const balances = await getBalances(user.id)
    const requests = await getMyRequests(user.id)
    const typedBalances = balances as DashboardBalance[]
    const typedRequests = requests as RecentRequest[]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, check your leave status.
                    </p>
                </div>
                <Link href="/requests/new" className={buttonVariants()}>
                    <Plus className="mr-2 h-4 w-4" /> New Request
                </Link>
            </div>

            {!profile && (
                <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <LayoutDashboard
                                className="h-5 w-5 text-yellow-400"
                                aria-hidden="true"
                            />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Profile Pending
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                    Your profile is not yet fully initialized.
                                    Please contact HR or wait for the system to
                                    process your account.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Balances Section */}
            <div>
                <h2 className="text-lg font-semibold mb-4 text-foreground">
                    Your Balances
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {typedBalances.length > 0 ? (
                        typedBalances.map((balance) => {
                            const category = getLeaveCategory(
                                balance.leave_types?.name,
                                balance.leave_types?.code,
                            )
                            const annualLimit = getAnnualLimit(
                                balance,
                                category,
                            )
                            const current = Number(balance.balance ?? 0)
                            const progressPct = annualLimit
                                ? Math.min(
                                      100,
                                      Math.max(
                                          0,
                                          (current / annualLimit) * 100,
                                      ),
                                  )
                                : null

                            return (
                                <Card
                                    key={balance.id}
                                    className="overflow-hidden border-l-4"
                                    style={{
                                        borderLeftColor:
                                            balance.leave_types.color ||
                                            "#3B82F6",
                                    }}
                                >
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {balance.leave_types.name}
                                        </CardTitle>
                                        <div
                                            className="h-4 w-4 rounded-full opacity-50"
                                            style={{
                                                backgroundColor:
                                                    balance.leave_types.color ||
                                                    "#3B82F6",
                                            }}
                                        />
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="text-2xl font-bold">
                                            {current.toFixed(1)}{" "}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                days
                                            </span>
                                        </div>

                                        {annualLimit ? (
                                            <>
                                                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${progressPct?.toFixed(2) ?? 0}%`,
                                                            backgroundColor:
                                                                balance
                                                                    .leave_types
                                                                    .color ||
                                                                "#3B82F6",
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {current.toFixed(1)} /{" "}
                                                    {annualLimit.toFixed(1)}{" "}
                                                    jours/an
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">
                                                {category === "remote"
                                                    ? "Pas de plafond annuel configuré"
                                                    : "Sans plafond annuel"}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })
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
                    <h2 className="text-lg font-semibold text-foreground">
                        Recent Requests
                    </h2>
                    <Link
                        href="/requests"
                        className={
                            buttonVariants({ variant: "ghost", size: "sm" }) +
                            " text-muted-foreground"
                        }
                    >
                        View all <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
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
                                {typedRequests.length > 0 ? (
                                    typedRequests.map((request) => (
                                        <tr
                                            key={request.id}
                                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                        >
                                            <td className="p-4 align-middle font-medium">
                                                {request.leave_types?.name ||
                                                    "Leave"}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {new Date(
                                                    request.start_date,
                                                ).toLocaleDateString()}{" "}
                                                -{" "}
                                                {new Date(
                                                    request.end_date,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge
                                                    variant={
                                                        request.status ===
                                                        "approved"
                                                            ? "success"
                                                            : request.status ===
                                                                "rejected"
                                                              ? "destructive"
                                                              : "warning"
                                                    }
                                                >
                                                    {request.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        request.status.slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Link
                                                    href={`/requests/${request.id}`}
                                                    className={buttonVariants({
                                                        variant: "ghost",
                                                        size: "sm",
                                                    })}
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="p-4 text-center text-muted-foreground h-24"
                                        >
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
