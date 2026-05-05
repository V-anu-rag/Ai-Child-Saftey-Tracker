"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  MapPin,
  Bell,
  Lock,
  Smartphone,
  Heart,
  Eye,
  Wifi,
  ArrowRight,
  Users,
  Globe,
  CheckCircle,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/common/Button";

const features = [
  {
    icon: MapPin,
    title: "Real-Time GPS Tracking",
    description:
      "Precise, live location updates every 30 seconds so you always know where your child is — whether at school, a friend's house, or on the way home.",
    color: "bg-app-red/10 text-app-red",
    border: "border-app-red/20",
  },
  {
    icon: Shield,
    title: "Smart Geofencing",
    description:
      "Create virtual safe zones around home, school, or the park. Receive instant alerts the moment your child crosses a boundary.",
    color: "bg-emerald-50 text-emerald-600",
    border: "border-app-green",
  },
  {
    icon: Bell,
    title: "SOS & Emergency Alerts",
    description:
      "One-tap SOS button on the child's device sends an immediate alert with their exact location to the parent dashboard.",
    color: "bg-teal-50 text-teal-600",
    border: "border-app-green",
  },
  {
    icon: Lock,
    title: "Secure Pairing System",
    description:
      "Unique pairing codes ensure only authorized parents can connect to a child's device. Regenerate codes anytime for added security.",
    color: "bg-app-jet/5 text-app-jet",
    border: "border-app-green",
  },
];

const values = [
  {
    icon: Heart,
    title: "Safety First",
    description:
      "Every feature, every line of code is designed with one goal: keeping children safe. We never compromise on reliability.",
    accent: "bg-app-red",
  },
  {
    icon: Eye,
    title: "Privacy by Design",
    description:
      "End-to-end encryption, COPPA compliance, and zero data selling. Your family's data is yours alone — always.",
    accent: "bg-app-salmon",
  },
  {
    icon: Wifi,
    title: "Always Connected",
    description:
      "Real-time socket connections ensure that alerts, locations, and status updates are delivered in under 30 seconds.",
    accent: "bg-app-salmon",
  },
];

const stats = [
  { value: "50K+", label: "Families Protected", icon: Users },
  { value: "180+", label: "Countries Served", icon: Globe },
  { value: "99.9%", label: "Uptime Guarantee", icon: CheckCircle },
  { value: "<30s", label: "Alert Delivery", icon: Bell },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-app-jet">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-app-red/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-app-salmon/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pt-32 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-sm font-medium px-4 py-2 rounded-full mb-8"
          >
            <Shield className="w-4 h-4 text-app-red" />
            About SafeTrack
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight"
          >
            Protecting What Matters{" "}
            <span className="text-app-salmon">Most</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            SafeTrack is an AI-powered child safety platform built by parents,
            for parents. We combine real-time GPS tracking, intelligent
            geofencing, and instant emergency alerts in one beautiful dashboard.
          </motion.p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-app-green">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-app-red/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-app-red" />
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-app-jet">
                  {stat.value}
                </p>
                <p className="text-sm text-app-jet/50 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-app-bg">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-app-red bg-app-red/10 px-4 py-1.5 rounded-full mb-4">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-app-jet leading-tight mb-6">
                Every Child Deserves to Be{" "}
                <span className="text-app-red">Safe</span>
              </h2>
              <p className="text-app-jet/60 leading-relaxed mb-4">
                In today&apos;s world, parents face growing challenges in
                keeping track of their children&apos;s whereabouts. SafeTrack
                was born from a simple belief: technology should empower parents,
                not overwhelm them.
              </p>
              <p className="text-app-jet/60 leading-relaxed mb-6">
                Our platform provides peace of mind through real-time location
                monitoring, smart geofencing boundaries, and instant emergency
                alerts — all while putting your family&apos;s privacy first with
                end-to-end encryption and full COPPA compliance.
              </p>
              <Link href="/signup">
                <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Join SafeTrack Today
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                {
                  num: "50K+",
                  label: "Active Families",
                  bg: "bg-app-red/10 border-app-red/20",
                },
                {
                  num: "2M+",
                  label: "Safe Arrivals Tracked",
                  bg: "bg-app-salmon/15 border-app-salmon/25",
                },
                {
                  num: "24/7",
                  label: "Monitoring & Support",
                  bg: "bg-app-salmon/15 border-app-salmon/25",
                },
                {
                  num: "0",
                  label: "Data Breaches. Ever.",
                  bg: "bg-app-jet/5 border-app-jet/10",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className={`rounded-2xl border p-6 text-center ${item.bg}`}
                >
                  <p className="text-2xl font-extrabold text-app-jet">
                    {item.num}
                  </p>
                  <p className="text-sm text-app-jet/60 mt-1">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-app-red bg-app-red/10 px-4 py-1.5 rounded-full mb-4">
              Core Features
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-app-jet">
              Built for{" "}
              <span className="text-app-red">Complete Protection</span>
            </h2>
            <p className="mt-4 text-lg text-app-jet/60 max-w-xl mx-auto">
              Every feature in SafeTrack is purpose-built to give parents full
              visibility and instant alerts when it matters most.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`rounded-2xl bg-white border ${feat.border} p-6 shadow-sm hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${feat.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-app-jet mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-app-jet/60 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-app-bg">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-app-red bg-app-red/10 px-4 py-1.5 rounded-full mb-4">
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-app-jet">
              What We <span className="text-app-red">Stand For</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="rounded-2xl bg-white border border-app-green p-6 shadow-sm hover:shadow-lg transition-shadow text-center"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${val.accent} flex items-center justify-center mx-auto mb-5 shadow-lg`}
                >
                  <val.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-app-jet mb-2">
                  {val.title}
                </h3>
                <p className="text-sm text-app-jet/60 leading-relaxed">
                  {val.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl bg-app-jet overflow-hidden text-center px-8 py-16"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-app-red/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-app-salmon/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-app-red flex items-center justify-center shadow-xl shadow-app-red/30">
                  <Shield className="w-9 h-9 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Ready to Protect Your{" "}
                <span className="text-app-salmon">Family</span>?
              </h2>
              <p className="text-lg text-white/60 max-w-xl mx-auto mb-8">
                Join thousands of parents who trust SafeTrack to keep their
                children safe every single day.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
