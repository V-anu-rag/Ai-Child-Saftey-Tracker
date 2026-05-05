"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
  asChild?: boolean;
}

const base =
  "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-app-red focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

const variants = {
  primary:
    "bg-app-red text-white hover:bg-app-red/90 shadow-md hover:shadow-lg hover:shadow-app-red/25",
  secondary:
    "bg-app-red/10 text-app-red border border-app-red/20 hover:bg-app-red/15 hover:border-app-red/40 shadow-sm",
  ghost: "bg-transparent text-app-jet hover:bg-app-jet/5 hover:text-app-red",
  danger:
    "bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500",
  outline:
    "bg-transparent text-app-jet border border-app-green hover:border-app-red/40 hover:text-app-red hover:bg-app-red/5",
};

const sizes = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3 gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  loading,
  children,
  className,
  disabled,
  asChild: _asChild,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </motion.button>
  );
}
