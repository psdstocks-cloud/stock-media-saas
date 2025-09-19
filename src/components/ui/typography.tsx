import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const typographyVariants = cva("", {
  variants: {
    variant: {
      display: "text-display",
      h1: "text-h1",
      h2: "text-h2", 
      h3: "text-h3",
      h4: "text-h4",
      h5: "text-h5",
      h6: "text-h6",
      body: "text-body",
      "body-lg": "text-body-lg",
      "body-sm": "text-body-sm",
      caption: "text-caption",
      overline: "text-overline",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary",
      destructive: "text-destructive",
      brand: "brand-text-gradient",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "default",
    align: "left",
  },
})

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, color, align, as, ...props }, ref) => {
    const Comp = as || (variant === "display" || variant?.startsWith("h") ? "h1" : "p")
    
    return (
      <Comp
        className={cn(typographyVariants({ variant, color, align, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Typography.displayName = "Typography"

export { Typography, typographyVariants }
