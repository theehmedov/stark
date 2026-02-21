import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-navy-600 text-white shadow-md shadow-navy-600/25 hover:bg-navy-500 hover:shadow-lg hover:shadow-gold/20",
        destructive:
          "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/30 hover:brightness-110",
        outline:
          "border border-navy-100 bg-white/80 backdrop-blur-sm text-navy-600 hover:bg-navy-50 hover:border-gold/40 shadow-sm",
        secondary:
          "bg-navy-50 text-navy-600 hover:bg-navy-100/80 shadow-sm",
        ghost: "text-navy-500 hover:bg-navy-50 hover:text-navy-600",
        link: "text-navy-600 underline-offset-4 hover:underline hover:text-gold-600",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
