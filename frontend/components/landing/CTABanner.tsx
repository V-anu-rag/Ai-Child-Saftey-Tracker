"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/common/Button";

export function CTABanner() {
  return (
    <section className="py-24 bg-app-jet">
      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-white/5 border border-white/10 overflow-hidden text-center px-8 py-16"
        >
          {/* Background accents */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-app-red/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-app-salmon/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-app-red flex items-center justify-center shadow-xl shadow-app-red/30">
                <Shield className="w-9 h-9 text-white" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Peace of Mind,
              <br />
              <span className="text-app-salmon">Starting Today</span>
            </h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-8">
              Join over 50,000 families who trust SafeTrack every single day.
              Start your free 14-day trial — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>Get Started Free</Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  View Demo Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
