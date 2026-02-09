import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { signOut } from '@/app/auth/actions'
import {
    CalendarDays,
    LayoutDashboard,
    ListTodo,
    LogOut,
    Users,
    Menu
} from 'lucide-react'

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Requests', href: '/requests', icon: ListTodo },
        { name: 'Calendar', href: '/calendar', icon: CalendarDays },
        { name: 'Team', href: '/team', icon: Users },
    ]

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar for Desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-50">
                <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
                    <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-100">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Scheduler</h1>
                    </div>

                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <nav className="flex-1 px-4 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                                    >
                                        <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    <div className="flex-shrink-0 border-t border-gray-100 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <img
                                    className="h-9 w-9 rounded-full bg-gray-300 ring-2 ring-white"
                                    src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                                    alt=""
                                />
                            </div>
                            <div className="ml-3 min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.email}
                                </p>
                                <form action={signOut}>
                                    <button
                                        type="submit"
                                        className="flex items-center text-xs font-medium text-gray-500 hover:text-red-600 transition-colors mt-0.5"
                                    >
                                        <LogOut className="mr-1.5 h-3 w-3" />
                                        Sign out
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-1 md:pl-64 transition-all duration-300">
                <main className="flex-1 py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
