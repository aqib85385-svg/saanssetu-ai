import React from "react";
import { cn } from "@/lib/utils/cn";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "error" | "success";
  title?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  className,
  ...props
}: AlertProps) {
  const styles = {
    info: {
      wrap: "bg-teal-50 border-teal-200 text-teal-900",
      icon: <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />,
    },
    warning: {
      wrap: "bg-amber-50 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    },
    error: {
      wrap: "bg-red-50 border-red-200 text-red-900",
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
    },
    success: {
      wrap: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    },
  };

  const current = styles[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 p-4 rounded-xl border text-sm leading-relaxed",
        current.wrap,
        className
      )}
      {...props}
    >
      {current.icon}
      <div className="space-y-1">
        {title && <h5 className="font-semibold">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}
