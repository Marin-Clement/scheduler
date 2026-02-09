import * as React from "react"
import { cn } from "@/utils/cn"

const textVariants = ({
    variant = 'p',
    align = 'left',
    className = '',
}: {
    variant?: "h1" | "h2" | "h3" | "h4" | "p" | "blockquote" | "lead" | "large" | "small" | "muted" | null
    align?: "left" | "center" | "right" | null
    className?: string
} = {}) => {
    const base = "text-foreground"

    const variants = {
        h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
        h4: "scroll-m-20 text-xl font-semibold tracking-tight",
        p: "leading-7 [&:not(:first-child)]:mt-6",
        blockquote: "mt-6 border-l-2 pl-6 italic",
        lead: "text-xl text-muted-foreground",
        large: "text-lg font-semibold",
        small: "text-sm font-medium leading-none",
        muted: "text-sm text-muted-foreground",
    }

    const aligns = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    }

    const selectedVariant = variants[(variant as keyof typeof variants) || 'p']
    const selectedAlign = aligns[(align as keyof typeof aligns) || 'left']

    return cn(base, selectedVariant, selectedAlign, className)
}

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
    as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "blockquote"
    variant?: "h1" | "h2" | "h3" | "h4" | "p" | "blockquote" | "lead" | "large" | "small" | "muted" | null
    align?: "left" | "center" | "right" | null
}

const Text = React.forwardRef<HTMLElement, TextProps>(
    ({ className, variant, align, as = "p", ...props }, ref) => {
        const Component = as as React.ElementType
        return (
            <Component
                ref={ref}
                className={textVariants({ variant, align, className })}
                {...props}
            />
        )
    }
)
Text.displayName = "Text"

export { Text, textVariants }
