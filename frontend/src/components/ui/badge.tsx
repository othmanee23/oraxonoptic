import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 shadow-sm",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20",
        secondary: "border-secondary/20 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20",
        success: "border-success/20 bg-success/10 text-success hover:bg-success/20",
        warning: "border-warning/20 bg-warning/10 text-warning hover:bg-warning/20",
        info: "border-info/20 bg-info/10 text-info hover:bg-info/20",
        outline: "border-border bg-transparent text-foreground hover:bg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
