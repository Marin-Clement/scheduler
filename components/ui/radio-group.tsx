"use client"

import * as React from "react"
import { cn } from "@/utils/cn"
import { Circle } from "lucide-react"

const RadioGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div className={cn("grid gap-2", className)} ref={ref} {...props} />
    )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
    return (
        <div className="relative flex items-center">
            <input
                type="radio"
                className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-primary text-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 checked:border-primary"
                ref={ref}
                {...props}
            />
            <Circle className="absolute h-2.5 w-2.5 top-[3px] left-[3px] fill-primary text-primary pointer-events-none hidden peer-checked:block" />
        </div>
    )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
