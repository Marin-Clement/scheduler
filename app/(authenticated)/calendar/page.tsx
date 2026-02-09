import { getTeamRequests, getUser } from '@/utils/supabase/queries'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

// Helper to get day of week for first day (0-6)
function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay()
}

export default async function CalendarPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string; year?: string }>
}) {
    const user = await getUser()
    if (!user) {
        redirect('/login')
    }

    const params = await searchParams
    const now = new Date()
    const currentMonth = params.month ? parseInt(params.month) : now.getMonth()
    const currentYear = params.year ? parseInt(params.year) : now.getFullYear()

    const requests = await getTeamRequests(user.id)

    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

    // Generate calendar grid days
    const days = []
    // Add empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push({ day: null })
    }
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentYear, currentMonth, i)
        // Find requests for this day
        const dayRequests = requests.filter((req: any) => {
            const start = new Date(req.start_date)
            const end = new Date(req.end_date)
            // Reset times to compare dates only
            start.setHours(0, 0, 0, 0)
            end.setHours(0, 0, 0, 0)
            date.setHours(0, 0, 0, 0)
            return date >= start && date <= end
        })
        days.push({ day: i, requests: dayRequests, date })
    }

    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })

    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Text variant="h2">Team Calendar</Text>
                    <Text variant="lead">View leave schedules for your team.</Text>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/calendar?month=${prevMonth}&year=${prevYear}`}
                        className={buttonVariants({ variant: "outline", size: "icon" })}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                    <div className="min-w-[150px] text-center font-semibold">
                        {monthName} {currentYear}
                    </div>
                    <Link
                        href={`/calendar?month=${nextMonth}&year=${nextYear}`}
                        className={buttonVariants({ variant: "outline", size: "icon" })}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="grid grid-cols-7 border-b text-center text-sm font-medium bg-muted/40">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="py-3 text-muted-foreground">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] text-sm">
                        {days.map((item, index) => (
                            <div
                                key={index}
                                className={`
                                    border-b border-r p-2 relative
                                    ${!item.day ? 'bg-muted/10' : ''}
                                    ${item.day && new Date().toDateString() === item.date?.toDateString() ? 'bg-primary/5' : ''}
                                `}
                            >
                                {item.day && (
                                    <>
                                        <div className="font-medium mb-1 text-right text-muted-foreground">
                                            {item.day}
                                        </div>
                                        <div className="space-y-1">
                                            {item.requests?.map((req: any) => (
                                                <div
                                                    key={req.id}
                                                    className="text-xs p-1.5 rounded border mb-1 truncate shadow-sm transition-all hover:opacity-80"
                                                    style={{
                                                        backgroundColor: req.leave_types?.color ? `${req.leave_types.color}20` : '#e2e8f0',
                                                        borderColor: req.leave_types?.color || '#cbd5e1',
                                                        color: req.leave_types?.color || '#334155'
                                                    }}
                                                    title={`${req.profiles.first_name} ${req.profiles.last_name} - ${req.leave_types?.name}`}
                                                >
                                                    <span className="font-semibold">{req.profiles.first_name.charAt(0)}.{req.profiles.last_name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
