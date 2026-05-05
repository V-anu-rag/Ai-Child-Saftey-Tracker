"use client";

import { motion } from "framer-motion";
import { UserPlus, Smartphone, MapPin, BellRing } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: UserPlus,
    title: "Create Your Family Account",
    description:
      "Sign up in under 2 minutes. Add all your children's profiles with their ages and devices.",
  },
  {
    num: "02",
    icon: Smartphone,
    title: "Install on Child's Device",
    description:
      "Download the SafeTrack child app on your kid's phone or tablet. Pair it with a simple QR code scan.",
  },
  {
    num: "03",
    icon: MapPin,
    title: "Set Up Safe Zones",
    description:
      "Draw geofence boundaries around home, school, and other trusted locations on the map.",
  },
  {
    num: "04",
    icon: BellRing,
    title: "Stay Informed, Instantly",
    description:
      "Receive real-time alerts for location updates, boundary crossings, and emergencies.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-app-red bg-app-red/10 px-4 py-1.5 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-app-jet">
            Up and Running in{" "}
            <span className="text-app-red">4 Simple Steps</span>
          </h2>
          <p className="mt-4 text-lg text-app-jet/60 max-w-xl mx-auto">
            No technical expertise needed. SafeTrack is designed to be simple for
            parents and unobtrusive for children.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="text-center flex flex-col items-center relative"
            >
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-app-jet flex items-center justify-center mb-5 shadow-lg shadow-app-jet/20">
                <step.icon className="w-7 h-7 text-white" />
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-app-red text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold text-app-jet mb-2">{step.title}</h3>
              <p className="text-sm text-app-jet/60 leading-relaxed max-w-[220px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
