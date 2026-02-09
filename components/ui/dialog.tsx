'use client'

import * as React from "react"
import { cn } from "@/utils/cn"
import { X } from "lucide-react"

const Dialog = ({
    children,
    open,
    onOpenChange,
}: {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) => {
    // Simple state management if not controlled, but generally controlled is preferred
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => onOpenChange?.(false)}
            />
            {/* Content Container */}
            <div className="relative z-50">
                {children}
            </div>
        </div>
    )
}

const DialogTrigger = ({ asChild, children, onClick, ...props }: any) => {
    // In a real controlled pattern, the parent handles the click. 
    // This is a simplified shim to match the typical Radix API structure used in the consumer code.
    // The consumer (AddBalanceDialog) uses a surrounding Dialog component with open state.
    // So the trigger just needs to render. The onClick logic in the consumer (setOpen(true)) is typically bound to the trigger.
    // Wait, typical Radix DialogTrigger doesn't take onClick, it just toggles the parent context.
    // Since I'm writing a custom one:
    // The usage in AddBalanceDialog is:
    // <Dialog open={open} onOpenChange={setOpen}>
    //   <DialogTrigger asChild>
    //     <Button ... />
    //   </DialogTrigger>
    // </Dialog>

    // To make this work without complex context, I'll need to refactor AddBalanceDialog slightly 
    // OR implement a context here. Context is cleaner.

    return children ? children : <button {...props}>Trigger</button>
}

// CONTEXT IMPLEMENTATION
interface DialogContextType {
    open: boolean
    setOpen: (open: boolean) => void
}
const DialogContext = React.createContext<DialogContextType | undefined>(undefined)

const DialogRoot = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
    const isControlled = open !== undefined
    const isOpen = isControlled ? open : uncontrolledOpen
    const setIsOpen = (newOpen: boolean) => {
        if (onOpenChange) {
            onOpenChange(newOpen)
        }
        if (!isControlled) {
            setUncontrolledOpen(newOpen)
        }
    }

    return (
        <DialogContext.Provider value={{ open: isOpen, setOpen: setIsOpen }}>
            {/* Render backdrop and dialog only if open, but we need to render Trigger always. */}
            {children}
        </DialogContext.Provider>
    )
}

const DialogTriggerRoot = ({ asChild, children, ...props }: any) => {
    const context = React.useContext(DialogContext)
    const handleClick = (e: React.MouseEvent) => {
        props.onClick?.(e)
        context?.setOpen(true)
    }

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, { ...props, onClick: handleClick })
    }

    return (
        <button onClick={handleClick} {...props}>
            {children}
        </button>
    )
}

const DialogContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    const context = React.useContext(DialogContext)
    if (!context?.open) return null

    // Portal logic would go here, but for simplicity we render in place with fixed positioning
    // We already have the Backdrop logic in the root? No, we need to split it.

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => context.setOpen(false)}
            />
            <div
                className={cn(
                    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
                    className
                )}
                {...props}
            >
                {children}
                <button
                    className="absolute right-4 top-4 opacity-70 hover:opacity-100"
                    onClick={() => context.setOpen(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
    )
}

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
    )
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
    )
)
DialogDescription.displayName = "DialogDescription"

export {
    DialogRoot as Dialog,
    DialogTriggerRoot as DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}
