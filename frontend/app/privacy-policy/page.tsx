"use client";

import { motion } from "framer-motion";
import { Shield, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "information-collected", title: "1. Information We Collect" },
  { id: "how-we-use", title: "2. How We Use Your Information" },
  { id: "data-security", title: "3. Data Security" },
  { id: "data-sharing", title: "4. Data Sharing & Third Parties" },
  { id: "childrens-privacy", title: "5. Children's Privacy (COPPA)" },
  { id: "your-rights", title: "6. Your Rights" },
  { id: "data-retention", title: "7. Data Retention" },
  { id: "updates", title: "8. Policy Updates" },
  { id: "contact-info", title: "9. Contact Information" },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  const handleClick = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative flex items-center justify-center overflow-hidden bg-app-jet">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-app-red/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-app-green/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pt-32 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-sm font-medium px-4 py-2 rounded-full mb-8"
          >
            <Shield className="w-4 h-4 text-app-red" />
            Legal
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight"
          >
            Privacy <span className="text-app-salmon">Policy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-white/50 text-sm"
          >
            Last updated: May 1, 2026 · Effective immediately
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-app-bg">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <div className="grid lg:grid-cols-[260px_1fr] gap-10">
            {/* Sidebar TOC */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="hidden lg:block"
            >
              <div className="sticky top-24 rounded-2xl bg-white border border-app-green/30 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-app-jet mb-4 uppercase tracking-wider">
                  Contents
                </h3>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleClick(s.id)}
                      className={cn(
                        "w-full text-left text-sm py-2 px-3 rounded-lg transition-all flex items-center gap-2",
                        activeSection === s.id
                          ? "bg-app-red/10 text-app-red font-semibold"
                          : "text-app-jet/60 hover:text-app-jet hover:bg-app-jet/5"
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          "w-3 h-3 flex-shrink-0 transition-transform",
                          activeSection === s.id && "rotate-90"
                        )}
                      />
                      {s.title}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.aside>

            {/* Policy Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl bg-white border border-app-green/30 p-8 md:p-10 shadow-sm"
            >
              {/* Intro */}
              <div className="mb-10 pb-8 border-b border-app-green/20">
                <p className="text-app-jet/70 leading-relaxed">
                  At SafeTrack, your family&apos;s privacy is our top priority.
                  This Privacy Policy explains how we collect, use, protect, and
                  share information when you use the SafeTrack platform,
                  including our web dashboard, mobile applications, and related
                  services. By using SafeTrack, you agree to the practices
                  described in this policy.
                </p>
              </div>

              {/* Section 1 */}
              <div id="information-collected" className="mb-10 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    1
                  </span>
                  Information We Collect
                </h2>
                <div className="space-y-4 text-app-jet/70 leading-relaxed">
                  <p>
                    We collect information to provide and improve our child
                    safety services. The types of information we collect include:
                  </p>
                  <div className="rounded-xl bg-app-bg border border-app-green/20 p-5">
                    <h4 className="text-sm font-bold text-app-jet mb-3">
                      Personal Information
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-app-red mt-2 flex-shrink-0" />
                        Parent name, email address, and account credentials
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-app-red mt-2 flex-shrink-0" />
                        Child&apos;s name, age, and assigned device information
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-app-red mt-2 flex-shrink-0" />
                        Device identifiers and pairing codes
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl bg-app-bg border border-app-green/20 p-5">
                    <h4 className="text-sm font-bold text-app-jet mb-3">
                      Location & Device Data
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-app-salmon mt-2 flex-shrink-0" />
                        Real-time GPS coordinates (latitude, longitude,
                        accuracy, altitude)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-app-salmon mt-2 flex-shrink-0" />
                        Device battery level, speed, and connectivity status
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-app-salmon mt-2 flex-shrink-0" />
                        Device model, operating system, and app version
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl bg-app-bg border border-app-green/20 p-5">
                    <h4 className="text-sm font-bold text-app-jet mb-3">
                      Usage Data
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-app-green mt-2 flex-shrink-0" />
                        Feature usage patterns (e.g., geofence creation, alert
                        interactions)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-app-green mt-2 flex-shrink-0" />
                        Login timestamps and session duration
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div id="how-we-use" className="mb-10 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    2
                  </span>
                  How We Use Your Information
                </h2>
                <div className="space-y-3 text-app-jet/70 leading-relaxed">
                  <p>We use collected information exclusively for:</p>
                  <ul className="space-y-2 pl-1">
                    {[
                      "Providing real-time location tracking and map visualization",
                      "Triggering geofence entry/exit alerts and SOS notifications",
                      "Displaying child status, battery level, and connectivity on the parent dashboard",
                      "Generating location history reports and activity timelines",
                      "Authenticating users and managing parent-child device pairing",
                      "Improving platform performance, reliability, and user experience",
                      "Communicating important service updates and security alerts",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm"
                      >
                        <span className="w-5 h-5 rounded-md bg-app-green/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-700" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 3 */}
              <div id="data-security" className="mb-10 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    3
                  </span>
                  Data Security
                </h2>
                <div className="space-y-4 text-app-jet/70 leading-relaxed">
                  <p>
                    We implement industry-standard security measures to protect
                    your data:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Encryption in Transit",
                        desc: "All data is transmitted using TLS 1.3 encryption between devices and our servers.",
                      },
                      {
                        title: "Encryption at Rest",
                        desc: "Stored data is encrypted using AES-256 encryption standards.",
                      },
                      {
                        title: "Access Control",
                        desc: "Role-based access ensures only authorized parents can view their children's data.",
                      },
                      {
                        title: "Regular Audits",
                        desc: "We conduct regular security audits and penetration testing.",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="rounded-xl bg-app-bg border border-app-green/20 p-4"
                      >
                        <h4 className="text-sm font-bold text-app-jet mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-app-jet/60">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div id="data-sharing" className="mb-10 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    4
                  </span>
                  Data Sharing & Third Parties
                </h2>
                <div className="space-y-4 text-app-jet/70 leading-relaxed">
                  <div className="rounded-xl bg-app-red/5 border border-app-red/20 p-5">
                    <p className="text-sm font-bold text-app-red mb-2">
                      🔒 We Never Sell Your Data
                    </p>
                    <p className="text-sm text-app-jet/60">
                      SafeTrack will never sell, rent, or trade your personal
                      information or your children&apos;s data to third parties
                      for advertising or marketing purposes. Period.
                    </p>
                  </div>
                  <p>We may share limited information only in these cases:</p>
                  <ul className="space-y-2 pl-1 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-app-jet/40 mt-2 flex-shrink-0" />
                      <strong>Service Providers:</strong>&nbsp;Cloud hosting
                      (MongoDB Atlas, AWS) and push notification services
                      (Firebase) that are contractually bound to protect your
                      data.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-app-jet/40 mt-2 flex-shrink-0" />
                      <strong>Legal Requirements:</strong>&nbsp;When required by
                      law, court order, or government regulation.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-app-jet/40 mt-2 flex-shrink-0" />
                      <strong>Emergency Situations:</strong>&nbsp;To protect the
                      safety of a child when an SOS alert has been triggered.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 5 */}
              <div id="childrens-privacy" className="mb-10 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    5
                  </span>
                  Children&apos;s Privacy (COPPA)
                </h2>
                <div className="space-y-4 text-app-jet/70 leading-relaxed">
                  <p>
                    SafeTrack is fully compliant with the Children&apos;s Online
                    Privacy Protection Act (COPPA). We take additional
                    precautions when handling children&apos;s data:
                  </p>
                  <ul className="space-y-2 pl-1 text-sm">
                    {[
                      "Only parents can create child profiles and initiate device pairing",
                      "Children's location data is only accessible to their verified parent",
                      "We collect the minimum data necessary for safety features to function",
                      "Parents can delete their child's data at any time from the Settings panel",
                      "No advertising or behavioral tracking is performed on children's data",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-md bg-app-red/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-app-red" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 6 */}
              <div id="your-rights" className="mb-10 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    6
                  </span>
                  Your Rights
                </h2>
                <div className="space-y-4 text-app-jet/70 leading-relaxed">
                  <p>
                    You have the following rights regarding your data on
                    SafeTrack:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      {
                        title: "Access",
                        desc: "Request a copy of all data we store about you and your children.",
                      },
                      {
                        title: "Correction",
                        desc: "Update or correct inaccurate information in your profile.",
                      },
                      {
                        title: "Deletion",
                        desc: "Permanently delete your account and all associated data.",
                      },
                      {
                        title: "Portability",
                        desc: "Export your data in a standard, machine-readable format.",
                      },
                      {
                        title: "Revoke Access",
                        desc: "Unpair devices and revoke tracking access at any time.",
                      },
                      {
                        title: "Opt Out",
                        desc: "Opt out of non-essential communications and analytics.",
                      },
                    ].map((right) => (
                      <div
                        key={right.title}
                        className="rounded-xl bg-app-bg border border-app-green/20 p-4"
                      >
                        <h4 className="text-sm font-bold text-app-jet mb-1">
                          {right.title}
                        </h4>
                        <p className="text-xs text-app-jet/60">{right.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 7 */}
              <div id="data-retention" className="mb-10 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    7
                  </span>
                  Data Retention
                </h2>
                <div className="space-y-3 text-app-jet/70 leading-relaxed text-sm">
                  <p>
                    We retain location history data for up to 90 days, after
                    which it is automatically purged. Account data is retained as
                    long as your account is active. Upon account deletion, all
                    associated data is permanently removed within 30 days.
                  </p>
                </div>
              </div>

              {/* Section 8 */}
              <div id="updates" className="mb-10 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    8
                  </span>
                  Policy Updates
                </h2>
                <div className="space-y-3 text-app-jet/70 leading-relaxed text-sm">
                  <p>
                    We may update this Privacy Policy from time to time to
                    reflect changes in our practices or legal requirements. When
                    we make significant changes, we will notify you via email and
                    display a prominent notice in the dashboard. We encourage you
                    to review this policy periodically.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div id="contact-info" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    9
                  </span>
                  Contact Information
                </h2>
                <div className="rounded-xl bg-app-bg border border-app-green/20 p-5">
                  <p className="text-sm text-app-jet/70 mb-3">
                    If you have any questions about this Privacy Policy or our
                    data practices, please contact us:
                  </p>
                  <div className="space-y-2 text-sm text-app-jet/60">
                    <p>
                      📧 Email:{" "}
                      <a
                        href="mailto:privacy@safetrack.app"
                        className="text-app-red hover:underline"
                      >
                        privacy@safetrack.app
                      </a>
                    </p>
                    <p>
                      🌐 Website:{" "}
                      <a href="/contact" className="text-app-red hover:underline">
                        safetrack.app/contact
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
