import * as React from "react";

import { cn } from "@/lib/utils";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-md border bg-background px-4 py-3 text-sm shadow-lg",
        variant === "destructive" &&
          "border-destructive/50 text-destructive-foreground",
        className,
      )}
      {...props}
    />
  ),
);
Toast.displayName = "Toast";

export interface ToastTitleProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ToastTitle = React.forwardRef<HTMLDivElement, ToastTitleProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  ),
);
ToastTitle.displayName = "ToastTitle";

export interface ToastDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  ToastDescriptionProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export { Toast, ToastTitle, ToastDescription };

