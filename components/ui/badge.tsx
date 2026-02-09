import * as React from "react"
import { cn } from "@/utils/cn"

const badgeVariants = ({
    variant = 'default',
    className = '',
}: {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | null
    className?: string
} = {}) => {
    const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

    const variants = {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-500 text-white hover:bg-emerald-600",
        warning: "border-transparent bg-amber-500 text-white hover:bg-amber-600",
    }

    const selectedVariant = variants[(variant as keyof typeof variants) || 'default']

    return cn(base, selectedVariant, className)
}

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | null
}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={badgeVariants({ variant, className })} {...props} />
    )
}

export { Badge, badgeVariants }
