"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Play, Star } from "lucide-react";
import { Button } from "@/components/common/Button";

const stats = [
  { value: "50K+", label: "Families Protected" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 30s", label: "Alert Speed" },
  { value: "4.9/5", label: "Parent Rating" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-app-jet">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-app-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-app-green/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-app-salmon/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-sm font-medium px-4 py-2 rounded-full mb-8"
        >
          <span className="w-2 h-2 bg-app-green rounded-full animate-pulse" />
          Real-time tracking, now available
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight"
        >
          Keep Your Kids{" "}
          <span className="relative">
            <span className="text-app-salmon">Safe</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute bottom-1 left-0 right-0 h-1 bg-app-red/60 rounded-full origin-left"
            />
          </span>
          ,<br />
          Always & Everywhere
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
        >
          SafeTrack gives parents real-time GPS tracking, intelligent geofencing,
          and instant SOS alerts — all in one beautifully simple dashboard.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>Start Free Trial</Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            leftIcon={<Play className="w-4 h-4 fill-white" />}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Watch Demo
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-sm text-white/40"
        >
          No credit card required · Cancel anytime · SOC 2 Compliant
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-extrabold text-white">
                {stat.value}
              </p>
              <p className="text-sm text-white/50 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Dashboard preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-16 relative"
        >
          <div className="rounded-2xl bg-white/5 border border-white/10 p-1.5 max-w-4xl mx-auto shadow-2xl shadow-black/40">
            <div className="rounded-xl overflow-hidden bg-app-bg aspect-video flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-app-bg to-app-green/40 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 p-8 w-full max-w-lg">
                  {[
                    { color: "bg-app-green", label: "Emma · Safe" },
                    { color: "bg-yellow-200", label: "Lucas · Warning" },
                    { color: "bg-app-green", label: "Sophie · Safe" },
                  ].map((c) => (
                    <div key={c.label} className={`rounded-xl ${c.color} p-4 text-center shadow-sm`}>
                      <div className="w-10 h-10 rounded-full bg-white mx-auto mb-2 shadow-sm" />
                      <p className="text-xs font-semibold text-app-jet">{c.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow */}
          <div className="absolute inset-0 bg-app-red/10 rounded-2xl blur-3xl -z-10 scale-95" />
        </motion.div>
      </div>
    </section>
  );
}
