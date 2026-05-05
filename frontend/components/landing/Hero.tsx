"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowRight, Play, Star, X } from "lucide-react";
import { Button } from "@/components/common/Button";

const stats = [
  { value: "50K+", label: "Families Protected" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 30s", label: "Alert Speed" },
  { value: "4.9/5", label: "Parent Rating" },
];

export function Hero() {
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-app-jet">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-app-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-app-salmon/10 rounded-full blur-3xl" />
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

      <AnimatePresence mode="wait">
        {!isPlayingDemo ? (
          <motion.div
            key="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pt-32 pb-20 text-center w-full"
          >
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
                leftIcon={<Play className="w-4 h-4 fill-white/20" />}
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => setIsPlayingDemo(true)}
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


          </motion.div>
        ) : (
          <motion.div
            key="video-demo"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 w-full flex flex-col items-center justify-center"
          >
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-2xl shadow-app-jet/50 bg-black group">
              <video
                src="/demo-video.mp4"
                autoPlay
                controls
                onEnded={() => setIsPlayingDemo(false)}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setIsPlayingDemo(false)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-white/60 text-sm"
            >
              The video will close automatically when finished.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
