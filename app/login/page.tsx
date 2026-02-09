import { login, signup, signInWithGoogle } from '../auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarDays, Mail } from 'lucide-react'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const params = await searchParams;

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Branding & Testimonials/Visuals */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-50 p-10 text-zinc-900 border-r border-zinc-200">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold">Scheduler</span>
                </div>
                <div>
                    <blockquote className="space-y-2">
                        <p className="text-lg text-zinc-700">
                            &ldquo;This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before.&rdquo;
                        </p>
                        <footer className="text-sm text-zinc-500">Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right: Auth Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="mx-auto w-full max-w-[350px] space-y-6">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to create your account
                        </p>
                    </div>

                    <div className="grid gap-6">

                        <form className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Button formAction={login}>
                                    Sign In with Email
                                </Button>
                                <Button variant="outline" formAction={signup}>
                                    Sign Up
                                </Button>
                            </div>

                            {params?.message && (
                                <p className="text-center text-sm text-red-600 bg-red-50 p-2 rounded">
                                    {params.message}
                                </p>
                            )}
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <form action={signInWithGoogle}>
                            <Button variant="outline" type="submit" className="w-full">
                                <Mail className="mr-2 h-4 w-4" />
                                Google
                            </Button>
                        </form>
                    </div>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <a href="#" className="underline underline-offset-4 hover:text-primary">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}
