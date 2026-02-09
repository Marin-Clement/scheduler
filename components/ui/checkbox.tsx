"use client"

import * as React from "react"
import { cn } from "@/utils/cn"
import { Check } from "lucide-react"

const Checkbox = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
    return (
        <div className="relative flex items-center">
            <input
                type="checkbox"
                className="peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                ref={ref}
                {...props}
            />
            <Check className="absolute top-0 left-0 h-4 w-4 pointer-events-none hidden peer-checked:block text-primary stroke-[3]" />
        </div>
    )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
