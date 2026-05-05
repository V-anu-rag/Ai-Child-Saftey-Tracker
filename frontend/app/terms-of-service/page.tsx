"use client";

import { motion } from "framer-motion";
import { Shield, ChevronRight, Scale, UserCheck, AlertCircle, Ban, Clock, FileText } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const sections = [
  { id: "introduction", title: "1. Introduction", icon: FileText },
  { id: "eligibility", title: "2. Eligibility", icon: UserCheck },
  { id: "account-responsibilities", title: "3. Account Responsibilities", icon: Shield },
  { id: "use-of-service", title: "4. Use of Service", icon: Scale },
  { id: "child-safety-consent", title: "5. Child Safety & Consent", icon: AlertCircle },
  { id: "real-time-tracking", title: "6. Tracking Disclaimer", icon: Clock },
  { id: "alerts-notifications", title: "7. Alerts Disclaimer", icon: AlertCircle },
  { id: "service-availability", title: "8. Availability", icon: Clock },
  { id: "limitation-liability", title: "9. Limitation of Liability", icon: Ban },
  { id: "termination", title: "10. Termination", icon: Ban },
  { id: "changes-to-terms", title: "11. Changes to Terms", icon: FileText },
  { id: "contact-info", title: "12. Contact Information", icon: FileText },
];

export default function TermsOfServicePage() {
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

        <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pt-32 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-sm font-medium px-4 py-2 rounded-full mb-8"
          >
            <Scale className="w-4 h-4 text-app-red" />
            Legal Framework
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight"
          >
            Terms of <span className="text-app-salmon">Service</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-white/50 text-sm"
          >
            Last updated: May 5, 2026 · Effective immediately
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-app-bg">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <div className="grid lg:grid-cols-[300px_1fr] gap-10">
            {/* Sidebar TOC */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="hidden lg:block"
            >
              <div className="sticky top-24 rounded-2xl bg-white border border-app-green/30 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-app-jet mb-4 uppercase tracking-wider">
                  Terms Sections
                </h3>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleClick(s.id)}
                      className={cn(
                        "w-full text-left text-xs py-2.5 px-3 rounded-lg transition-all flex items-center gap-2",
                        activeSection === s.id
                          ? "bg-app-red/10 text-app-red font-bold"
                          : "text-app-jet/60 hover:text-app-jet hover:bg-app-jet/5"
                      )}
                    >
                      <s.icon className={cn("w-3.5 h-3.5", activeSection === s.id ? "text-app-red" : "text-app-jet/40")} />
                      {s.title}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.aside>

            {/* Terms Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl bg-white border border-app-green/30 p-8 md:p-10 shadow-sm"
            >
              {/* Intro */}
              <div id="introduction" className="mb-12 pb-8 border-b border-app-green/20 scroll-mt-24">
                <h2 className="text-2xl font-bold text-app-jet mb-4">1. Introduction</h2>
                <div className="space-y-4 text-app-jet/70 leading-relaxed">
                  <p>
                    Welcome to SafeTrack. These Terms of Service (&quot;Terms&quot;) govern your access to and use of SafeTrack&apos;s website, dashboard, and mobile applications (collectively, the &quot;Service&quot;). SafeTrack is a child safety tracking platform designed to provide parents and guardians with real-time location data and safety alerts.
                  </p>
                  <p className="font-semibold text-app-jet">
                    By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div id="eligibility" className="mb-12 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    2
                  </span>
                  Eligibility
                </h2>
                <div className="space-y-4 text-app-jet/70 leading-relaxed">
                  <p>To use SafeTrack, you must:</p>
                  <ul className="space-y-2 pl-1">
                    <li className="flex items-start gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-app-red mt-2 flex-shrink-0" />
                      Be at least 18 years of age.
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-app-red mt-2 flex-shrink-0" />
                      Be the legal parent or guardian of the child whose device you are tracking.
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-app-red mt-2 flex-shrink-0" />
                      Have the legal authority to install the SafeTrack application on the child&apos;s device.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 3 */}
              <div id="account-responsibilities" className="mb-12 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    3
                  </span>
                  Account Responsibilities
                </h2>
                <div className="space-y-4 text-app-jet/70 leading-relaxed text-sm">
                  <p>
                    When you create an account, you must provide accurate, complete, and current information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                  </p>
                  <div className="bg-app-bg border border-app-green/20 rounded-xl p-4">
                    <p className="font-bold text-app-jet mb-2">Security Warning:</p>
                    <p className="text-app-jet/60">
                      You must immediately notify SafeTrack of any unauthorized use of your account or any other breach of security. SafeTrack will not be liable for any loss or damage arising from your failure to comply with this security obligation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div id="use-of-service" className="mb-12 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    4
                  </span>
                  Use of Service
                </h2>
                <div className="space-y-4 text-app-jet/70 leading-relaxed text-sm">
                  <p>You agree to use the Service only for lawful purposes. You shall not:</p>
                  <ul className="space-y-3">
                    {[
                      "Track any individual without their legal consent (or legal authority in the case of a child).",
                      "Use the Service to stalk, harass, or threaten any individual.",
                      "Reverse engineer, decompile, or attempt to extract the source code of the Service.",
                      "Interfere with or disrupt the integrity or performance of the Service.",
                      "Access the Service using unauthorized automated means (bots, scrapers, etc.).",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Ban className="w-4 h-4 text-app-red mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 5 - CRITICAL */}
              <div id="child-safety-consent" className="mb-12 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    5
                  </span>
                  Child Safety & Consent
                </h2>
                <div className="space-y-4 text-app-jet/70 leading-relaxed">
                  <div className="rounded-xl bg-app-red/5 border border-app-red/20 p-6">
                    <h4 className="text-sm font-extrabold text-app-red mb-3 uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Critical Legal Requirement
                    </h4>
                    <p className="text-sm text-app-jet/80 mb-4">
                      By using SafeTrack to track a child&apos;s device, you represent and warrant that you are the legal parent or guardian of that child and have the legal right to monitor their location.
                    </p>
                    <p className="text-xs text-app-jet/60 italic">
                      Installation of tracking software on a device without the owner&apos;s (or legal guardian&apos;s) consent is illegal in many jurisdictions. You are solely responsible for ensuring that your use of SafeTrack complies with all applicable local, state, and national laws.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 6 */}
              <div id="real-time-tracking" className="mb-12 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    6
                  </span>
                  Real-Time Tracking Disclaimer
                </h2>
                <div className="space-y-4 text-app-jet/70 leading-relaxed text-sm">
                  <p>
                    SafeTrack relies on GPS, Wi-Fi, and cellular data to provide location information. Accuracy can be affected by environmental factors, device settings, signal strength, and network availability.
                  </p>
                  <p className="bg-app-bg border border-app-green/20 p-4 rounded-xl font-medium">
                    ⚠️ SafeTrack is a supplemental safety tool and is NOT a replacement for active parental supervision. Do not rely solely on the Service in life-threatening or emergency situations.
                  </p>
                </div>
              </div>

              {/* Section 7 */}
              <div id="alerts-notifications" className="mb-12 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    7
                  </span>
                  Alerts & Notifications Disclaimer
                </h2>
                <div className="space-y-3 text-app-jet/70 leading-relaxed text-sm">
                  <p>
                    Geofence and SOS alerts depend on the child device&apos;s ability to transmit data to our servers and our ability to send push notifications to your device. Alerts may be delayed, inaccurate, or fail to deliver due to:
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {[
                      "Poor internet connectivity",
                      "Device power management settings",
                      "Operating system restrictions",
                      "Server maintenance or downtime",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 px-3 py-2 bg-app-bg rounded-lg border border-app-green/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-app-salmon" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 8 */}
              <div id="service-availability" className="mb-12 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    8
                  </span>
                  Service Availability
                </h2>
                <p className="text-app-jet/70 leading-relaxed text-sm">
                  We strive to provide 99.9% uptime, but we do not guarantee that the Service will be uninterrupted, timely, secure, or error-free. We may perform maintenance, updates, or experience technical issues that temporarily limit access to the Service.
                </p>
              </div>

              {/* Section 9 */}
              <div id="limitation-liability" className="mb-12 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    9
                  </span>
                  Limitation of Liability
                </h2>
                <div className="space-y-4 text-app-jet/70 leading-relaxed text-sm">
                  <p className="uppercase font-bold text-xs text-app-jet/50 tracking-widest">Legal Disclaimer</p>
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, SAFETRACK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                  </p>
                  <p>
                    SAFETRACK IS NOT RESPONSIBLE FOR ANY INCIDENTS, ACCIDENTS, OR HARM THAT MAY BEFALL A CHILD OR ANY OTHER PERSON WHILE USING OR FAILING TO USE THE SERVICE.
                  </p>
                </div>
              </div>

              {/* Section 10 */}
              <div id="termination" className="mb-12 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    10
                  </span>
                  Termination
                </h2>
                <p className="text-app-jet/70 leading-relaxed text-sm">
                  We may terminate or suspend your account immediately, without prior notice or liability, if you breach these Terms. Upon termination, your right to use the Service will cease immediately. You may also delete your account at any time through the dashboard settings.
                </p>
              </div>

              {/* Section 11 */}
              <div id="changes-to-terms" className="mb-12 scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    11
                  </span>
                  Changes to Terms
                </h2>
                <p className="text-app-jet/70 leading-relaxed text-sm">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                </p>
              </div>

              {/* Section 12 */}
              <div id="contact-info" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-app-jet mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-app-red/10 flex items-center justify-center text-app-red text-sm font-extrabold">
                    12
                  </span>
                  Contact Information
                </h2>
                <div className="rounded-xl bg-app-bg border border-app-green/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-app-jet">Have questions about our Terms?</p>
                    <p className="text-xs text-app-jet/60">Our legal team is here to help clarify any clauses.</p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/contact">
                      <button className="px-5 py-2.5 rounded-xl bg-app-jet text-white text-xs font-bold hover:bg-app-jet/90 transition-all shadow-lg shadow-app-jet/20">
                        Contact Us
                      </button>
                    </Link>
                    <a href="mailto:legal@safetrack.app">
                      <button className="px-5 py-2.5 rounded-xl bg-white border border-app-green/30 text-app-jet text-xs font-bold hover:bg-app-bg transition-all">
                        Email Legal
                      </button>
                    </a>
                  </div>
                </div>
                <p className="mt-8 text-center text-xs text-app-jet/40">
                  Refer to our <Link href="/privacy-policy" className="text-app-red hover:underline font-semibold">Privacy Policy</Link> for details on how we handle your data.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
