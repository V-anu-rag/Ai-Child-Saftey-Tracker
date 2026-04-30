"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export function SectionWrapper({
  children,
  className,
  title,
  description,
  action,
  noPadding = false,
}: SectionWrapperProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-2xl bg-white border border-app-green/40 shadow-sm",
        !noPadding && "p-6",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-5 px-6 pt-6">
          <div>
            {title && (
              <h2 className="text-lg font-bold text-app-jet">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-app-jet/50 mt-0.5">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {noPadding ? children : <div>{children}</div>}
    </motion.section>
  );
}
