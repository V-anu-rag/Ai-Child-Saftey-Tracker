"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: any;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export function SectionWrapper({
  children,
  className,
  title,
  description,
  icon: Icon,
  action,
  noPadding = false,
}: SectionWrapperProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-2xl bg-white border p-2 border-app-green/40 shadow-sm",
        !noPadding && "p-6",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-start gap-3">
            {Icon && <div className="w-10 h-10 rounded-xl bg-app-bg flex items-center justify-center flex-shrink-0 mt-0.5"><Icon className="w-5 h-5 text-app-jet/40" /></div>}
            <div>
              {title && (
                <h2 className="text-lg font-bold text-app-jet">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-app-jet/50 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {noPadding ? children : <div>{children}</div>}
    </motion.section>
  );
}
