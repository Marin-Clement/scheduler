import { createClient } from "./server"
import { cache } from "react"

type LeaveTypeRow = {
    id: string
    name: string
    code: string | null
    color: string | null
    default_monthly_increment: number | string | null
}

type LeaveBalanceRow = {
    id: string
    leave_type_id: string
    balance: number | string | null
    monthly_increment: number | string | null
}

type TeamRequestRow = {
    profile_id: string
    status: string
    start_date: string
    end_date: string
    profiles: {
        team_id: string | null
        org_id: string | null
    }
    [key: string]: unknown
}

type ProfileBalanceRow = {
    profile_id: string
}

export const getUser = cache(async () => {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    return user
})

export const getProfile = cache(async (userId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

    if (error) {
        console.error("Error fetching profile:", error)
    }

    return data
})

export const getBalances = cache(async (userId: string) => {
    const supabase = await createClient()
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", userId)
        .single()

    if (profileError || !profile?.org_id) {
        console.error("Error fetching profile org for balances:", profileError)
        return []
    }

    const { data: leaveTypes, error: leaveTypesError } = await supabase
        .from("leave_types")
        .select("id, name, code, color, default_monthly_increment")
        .eq("org_id", profile.org_id)
        .order("name", { ascending: true })

    if (leaveTypesError) {
        console.error(
            "Error fetching leave types for balances:",
            leaveTypesError,
        )
        return []
    }

    const { data: balances, error: balancesError } = await supabase
        .from("leave_balances")
        .select("id, leave_type_id, balance, monthly_increment")
        .eq("profile_id", userId)

    if (balancesError) {
        console.error("Error fetching leave balances:", balancesError)
        return []
    }

    const typedBalances = (balances || []) as LeaveBalanceRow[]
    const typedLeaveTypes = (leaveTypes || []) as LeaveTypeRow[]

    const balanceByTypeId = new Map(
        typedBalances.map((b) => [b.leave_type_id, b]),
    )

    return typedLeaveTypes.map((leaveType) => {
        const existingBalance = balanceByTypeId.get(leaveType.id)
        return {
            id: existingBalance?.id || `virtual-${leaveType.id}`,
            profile_id: userId,
            leave_type_id: leaveType.id,
            balance: Number(existingBalance?.balance ?? 0),
            monthly_increment: Number(existingBalance?.monthly_increment ?? 0),
            leave_types: {
                name: leaveType.name,
                code: leaveType.code,
                color: leaveType.color,
                default_monthly_increment: Number(
                    leaveType.default_monthly_increment ?? 0,
                ),
            },
        }
    })
})

export const getMyRequests = cache(async (userId: string) => {
    const supabase = await createClient()
    const { data } = await supabase
        .from("leave_requests")
        .select(
            `
      *,
      leave_types (
        name,
        code
      )
    `,
        )
        .eq("profile_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

    return data || []
})

export const getRequest = cache(async (requestId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("leave_requests")
        .select(
            `
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
    `,
        )
        .eq("id", requestId)
        .single()

    if (error) {
        console.error("Error fetching request:", error)
    }

    return data
})

export const getTeamMembers = cache(async (userId: string) => {
    const supabase = await createClient()

    // First get the user's profile to know their team/org
    const { data: profile } = await supabase
        .from("profiles")
        .select("org_id, team_id")
        .eq("id", userId)
        .single()

    if (!profile) return []

    // Then fetch colleagues
    let query = supabase
        .from("profiles")
        .select("*")
        .eq("org_id", profile.org_id)
        .neq("id", userId) // Exclude self if desired, or keep it. Let's keep it to show whole team.

    if (profile.team_id) {
        query = query.eq("team_id", profile.team_id)
    }

    const { data, error } = await query

    if (error) {
        console.error("Error fetching team members:", error)
        return []
    }

    return data
})

export const getTeamRequests = cache(async (userId: string) => {
    const supabase = await createClient()

    // Get user's context
    const { data: profile } = await supabase
        .from("profiles")
        .select("org_id, team_id")
        .eq("id", userId)
        .single()

    if (!profile) return []

    // Fetch requests for the team
    // We need to filter by profiles in the same team.
    // This might involve a join or a second query.
    // Optimization: Fetch team IDs first or use a join if RLS allows.
    // Given RLS usually filters by org/team, we might just be able to query leave_requests directly if policies allow reading co-workers.
    // Assuming 'leave_requests' RLS allows reading rows where user is in same org/team.

    const { data, error } = await supabase
        .from("leave_requests")
        .select(
            `
      *,
      leave_types (
        name,
        code,
        color
      ),
      profiles!leave_requests_profile_id_fkey (
        id,
        first_name,
        last_name,
        email,
        team_id,
        org_id
      )
    `,
        )
        .order("start_date", { ascending: true })

    if (error) {
        console.error("Error fetching team requests:", error)
        return []
    }

    // Filter in memory for simplicity if RLS is broad, or rely on RLS.
    // Let's rely on RLS to return what the user is allowed to see (usually their org/team).
    // But to be safe and specific to "Team View":
    const teamRequests = (data as TeamRequestRow[]).filter((req) => {
        // If user has a team_id, strict filter by team. If not (e.g. admin/CEO), maybe show all org?
        // Let's stick to strict team match if team_id exists.
        if (profile.team_id) {
            return req.profiles.team_id === profile.team_id
        }
        return req.profiles.org_id === profile.org_id
    })

    return teamRequests
})

export const getAllEmployees = cache(async (orgId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("org_id", orgId)
        .order("last_name", { ascending: true })

    if (error) {
        console.error("Error fetching employees:", error)
        return []
    }
    return data
})

export const getLeaveTypes = cache(async (orgId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("leave_types")
        .select("*")
        .eq("org_id", orgId)
        .order("name", { ascending: true })

    if (error) {
        console.error("Error fetching leave types:", error)
        return []
    }
    return data
})

export const getAllOrganizationRequests = cache(
    async (
        orgId: string,
        status: "pending" | "approved" | "rejected" = "pending",
    ) => {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from("leave_requests")
            .select(
                `
      *,
      leave_types (
        name,
        code,
        color
      ),
      profiles!leave_requests_profile_id_fkey (
        first_name,
        last_name,
        email,
        role,
        avatar_url
      )
    `,
            )
            .eq("org_id", orgId)
            .eq("status", status)
            .order("created_at", { ascending: true })

        if (error) {
            console.error("Error fetching org requests:", error)
            return []
        }
        return data
    },
)

export const getAllEmployeesWithBalances = cache(async (orgId: string) => {
    const supabase = await createClient()

    // Get all employees
    const { data: employees, error: empError } = await supabase
        .from("profiles")
        .select("*")
        .eq("org_id", orgId)
        .order("last_name", { ascending: true })

    if (empError || !employees) {
        console.error("Error fetching employees:", empError)
        return []
    }

    // Get all balances for the org
    const { data: balances, error: balError } = await supabase
        .from("leave_balances")
        .select(
            `
      *,
      leave_types (
        id,
        name,
        code,
        color
      )
    `,
        )
        .eq("org_id", orgId)

    if (balError) {
        console.error("Error fetching balances:", balError)
    }

    // Join balances to employees
    return employees.map((emp) => ({
        ...emp,
        balances: ((balances || []) as ProfileBalanceRow[]).filter(
            (b) => b.profile_id === emp.id,
        ),
    }))
})

export const getRemoteWorkPolicies = cache(async (orgId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("remote_work_policies")
        .select(
            `
      *,
      profiles (
        id,
        first_name,
        last_name
      )
    `,
        )
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching remote work policies:", error)
        return []
    }
    return data
})

export const getOrgLeaveSettings = cache(async (orgId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("leave_types")
        .select("*")
        .eq("org_id", orgId)
        .order("name", { ascending: true })

    if (error) {
        console.error("Error fetching leave settings:", error)
        return []
    }
    return data
})
