import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  icon: LucideIcon;
  iconColor?: "primary" | "success" | "warning" | "info";
}

const iconColorClasses = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

const trendClasses = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-muted-foreground",
};

export function StatCard({ title, value, change, icon: Icon, iconColor = "primary" }: StatCardProps) {
  return (
    <div className="stat-card rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-card-foreground">{value}</p>
          {change && (
            <p className={cn("text-sm font-medium", trendClasses[change.trend])}>
              {change.trend === "up" && "↑ "}
              {change.trend === "down" && "↓ "}
              {change.value}
            </p>
          )}
        </div>
        <div className={cn("rounded-xl p-3", iconColorClasses[iconColor])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
