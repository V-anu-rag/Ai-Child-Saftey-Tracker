"use client";

import { motion } from "framer-motion";
import { MapPin, Bell, Shield, Activity, Smartphone, Lock } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Real-Time GPS Tracking",
    description:
      "Know exactly where your child is at any moment with precise, live GPS updates every 30 seconds.",
    color: "bg-app-red/10 text-app-red",
    border: "border-app-red/20",
  },
  {
    icon: Bell,
    title: "Instant SOS Alerts",
    description:
      "Your child can send an emergency SOS with one tap. You'll be notified instantly with their location.",
    color: "bg-app-salmon/20 text-app-salmon",
    border: "border-app-salmon/30",
  },
  {
    icon: Shield,
    title: "Smart Geofencing",
    description:
      "Set virtual safe zones around home, school, or any location. Get alerted when boundaries are crossed.",
    color: "bg-app-green/40 text-green-700",
    border: "border-app-green/50",
  },
  {
    icon: Activity,
    title: "Activity Monitoring",
    description:
      "Review a full timeline of your child's movements and device activities throughout the day.",
    color: "bg-purple-100 text-purple-600",
    border: "border-purple-200",
  },
  {
    icon: Smartphone,
    title: "Multi-Device Support",
    description:
      "Monitor multiple children across different devices — iOS, Android, and tablets all supported.",
    color: "bg-blue-100 text-blue-600",
    border: "border-blue-200",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "End-to-end encrypted data with full COPPA compliance. Your family's data stays private, always.",
    color: "bg-app-jet/10 text-app-jet",
    border: "border-app-jet/20",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-app-bg">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-app-red bg-app-red/10 px-4 py-1.5 rounded-full mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-app-jet leading-tight">
            Everything You Need to <br />
            <span className="text-app-red">Keep Kids Safe</span>
          </h2>
          <p className="mt-4 text-lg text-app-jet/60 max-w-xl mx-auto">
            SafeTrack combines powerful technology with an intuitive design so
            parents can stay connected without feeling like a surveillance system.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className={`rounded-2xl bg-white border ${feat.border} p-6 shadow-sm hover:shadow-lg transition-shadow`}
            >
              <div className={`w-12 h-12 rounded-xl ${feat.color} flex items-center justify-center mb-4`}>
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-app-jet mb-2">{feat.title}</h3>
              <p className="text-sm text-app-jet/60 leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
