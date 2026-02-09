import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { ArrowLeft, FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="flex justify-center">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <FileQuestion className="h-10 w-10 text-primary" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Page Not Found</h1>
                    <p className="text-muted-foreground">
                        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
                    </p>
                </div>
                <Link href="/dashboard" className={buttonVariants()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>
            </div>
        </div>
    )
}
