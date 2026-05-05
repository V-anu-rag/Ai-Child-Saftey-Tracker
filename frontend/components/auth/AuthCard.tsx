"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-app-jet flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-app-red/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-app-green/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-app-salmon/5 rounded-full blur-3xl" />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-app-red flex items-center justify-center shadow-lg shadow-app-red/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              Safe<span className="text-app-red">Track</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">{title}</h1>
          <p className="text-sm text-white/50 mt-2">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
          {children}
        </div>

        {/* Back to home */}
        <p className="text-center text-sm text-white/40 mt-6">
          <Link href="/" className="hover:text-white transition-colors">
            ← Back to SafeTrack home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
