import { createClient } from "@/utils/supabase/server"
import type {
    LeaveRequestItem,
    LeaveBalanceItem,
} from "@/components/ui/date-range-picker"
import RequestForm from "./request-form"

type ExistingLeaveRow = {
    id: string
    start_date: string
    end_date: string
    start_half: string | null
    end_half: string | null
    leave_type_id: string
    status: "pending" | "approved"
}

async function getLeaveTypes() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    // Ideally we should filter by the user's contract type if applicable
    // For now, fetching all leave types for the org
    const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single()
    if (!profile) {
        console.error("getLeaveTypes: No profile found for user", user.id)
        return []
    }

    console.log("getLeaveTypes: Profile found, org_id:", profile.org_id)

    // Debug: Check what the DB thinks the org ID is via the function
    const { data: dbOrgId, error: rpcError } =
        await supabase.rpc("get_my_org_id")
    console.log(
        "getLeaveTypes: DB Function get_my_org_id returned:",
        dbOrgId,
        "Error:",
        rpcError,
    )

    const { data, error } = await supabase.from("leave_types").select("*")
    // Try removing the filter temporarily to see if RLS works at all (it should filter by itself)
    // .eq('org_id', profile.org_id)
    // Keeping it is fine, but if RLS matches, it matches.

    if (error) {
        console.error("getLeaveTypes: Error fetching leave types:", error)
    } else {
        console.log("getLeaveTypes: Fetched types:", data)
    }

    return data || []
}

async function getBookedRequests(): Promise<LeaveRequestItem[]> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from("leave_requests")
        .select(
            "id, start_date, end_date, start_half, end_half, leave_type_id, status",
        )
        .eq("profile_id", user.id)
        .in("status", ["pending", "approved"])

    if (error || !data) {
        console.error(
            "getBookedRequests: Error fetching booked requests",
            error,
        )
        return []
    }

    const rows = (data ?? []) as ExistingLeaveRow[]

    return rows
        .filter((row) => row.start_date && row.end_date && row.leave_type_id)
        .map((row) => {
            const startHalf = String(row.start_half || "").toLowerCase()
            const endHalf = String(row.end_half || "").toLowerCase()

            return {
                id: `existing-${row.id}`,
                type: row.leave_type_id,
                range: {
                    from: new Date(row.start_date),
                    to: new Date(row.end_date),
                    fromHalfDay:
                        startHalf === "pm" || startHalf === "afternoon",
                    toHalfDay: endHalf === "am" || endHalf === "morning",
                },
            }
        })
}

type LeaveBalanceRow = {
    leave_type_id: string
    balance: number | string | null
    leave_types: {
        name: string
        code: string | null
    } | null
}

async function getLeaveBalances(): Promise<LeaveBalanceItem[]> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from("leave_balances")
        .select("leave_type_id, balance, leave_types(name, code)")
        .eq("profile_id", user.id)

    if (error || !data) {
        console.error("getLeaveBalances: Error fetching balances", error)
        return []
    }

    const rows = data as unknown as LeaveBalanceRow[]
    return rows
        .filter((row) => row.leave_type_id)
        .map((row) => ({
            leaveTypeId: row.leave_type_id,
            name: row.leave_types?.name || "Unknown",
            code: row.leave_types?.code ?? null,
            balance: Number(row.balance ?? 0),
        }))
}

export default async function NewRequestPage() {
    const leaveTypes = await getLeaveTypes()
    const bookedRequests = await getBookedRequests()
    const leaveBalances = await getLeaveBalances()

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">New Leave Request</h1>
            <RequestForm
                leaveTypes={leaveTypes}
                bookedRequests={bookedRequests}
                leaveBalances={leaveBalances}
            />
        </div>
    )
}
