"use client"

import * as React from "react"

interface TooltipProviderProps {
    children: React.ReactNode
}

export function TooltipProvider({ children }: TooltipProviderProps) {
    return <>{children}</>
}

interface TooltipProps {
    children: React.ReactNode
}

export function Tooltip({ children }: TooltipProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <div 
            className="relative inline-block"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    if (child.type === TooltipTrigger) {
                        return child
                    }
                    if (child.type === TooltipContent) {
                        return isOpen ? child : null
                    }
                }
                return child
            })}
        </div>
    )
}

interface TooltipTriggerProps {
    children: React.ReactNode
    asChild?: boolean
}

export function TooltipTrigger({ children, asChild }: TooltipTriggerProps) {
    return <>{children}</>
}

interface TooltipContentProps {
    children: React.ReactNode
    className?: string
}

export function TooltipContent({ children, className }: TooltipContentProps) {
    return (
        <div className={`
            absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
            px-3 py-1.5 rounded-md bg-popover text-popover-foreground
            text-sm shadow-md border animate-in fade-in-0 zoom-in-95
            ${className || ''}
        `}>
            {children}
        </div>
    )
}
