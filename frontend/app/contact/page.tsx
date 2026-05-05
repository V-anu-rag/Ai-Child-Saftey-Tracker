"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageSquare,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/common/Button";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    value: "support@safetrack.app",
    description: "We'll respond within 24 hours",
    color: "bg-app-red/10 text-app-red",
  },
  {
    icon: Phone,
    title: "Call Us",
    value: "+1 (800) SAFE-TRK",
    description: "Mon–Fri, 9am–6pm EST",
    color: "bg-app-green/30 text-green-700",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    value: "San Francisco, CA",
    description: "By appointment only",
    color: "bg-app-salmon/20 text-app-salmon",
  },
];

const faqs = [
  {
    question: "Is SafeTrack free to use?",
    answer:
      "SafeTrack offers a free 14-day trial with full access to all features. After the trial, flexible pricing plans are available to fit every family's needs.",
  },
  {
    question: "How accurate is the GPS tracking?",
    answer:
      "SafeTrack uses your child's device GPS which typically provides accuracy within 5-15 meters in outdoor environments. Indoor accuracy may vary depending on the device and available signals.",
  },
  {
    question: "Can my child disable the tracking?",
    answer:
      "The SafeTrack child app runs as a background service. If it is stopped or the device is powered off, parents receive an immediate 'Connectivity Alert' notification on their dashboard.",
  },
  {
    question: "Is my family's data safe?",
    answer:
      "Absolutely. We use end-to-end encryption (TLS 1.3 + AES-256), are fully COPPA compliant, and never sell your data. You can review our complete Privacy Policy for more details.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "You can delete your account and all associated data from the Settings page in your dashboard. All data is permanently purged within 30 days of deletion.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!form.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    toast.success("Message sent successfully! We'll get back to you soon.");
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
            <MessageSquare className="w-4 h-4 text-app-red" />
            Get in Touch
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight"
          >
            Contact <span className="text-app-salmon">Us</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg text-white/60 max-w-xl mx-auto"
          >
            Have a question or need help? Our team is here to support you.
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="bg-white border-b border-app-green/30">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-10">
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((info, i) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="rounded-2xl border border-app-green/30 p-5 text-center hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${info.color} flex items-center justify-center mx-auto mb-3`}
                >
                  <info.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-app-jet mb-1">{info.title}</h3>
                <p className="text-sm font-semibold text-app-jet/80">
                  {info.value}
                </p>
                <p className="text-xs text-app-jet/50 mt-1 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> {info.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + FAQ */}
      <section className="py-20 bg-app-bg">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-app-red bg-app-red/10 px-4 py-1.5 rounded-full mb-4">
                Send a Message
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-app-jet mb-6">
                We&apos;d Love to <span className="text-app-red">Hear</span>{" "}
                From You
              </h2>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-white border border-app-green/40 p-10 text-center shadow-sm"
                >
                  <div className="w-16 h-16 rounded-2xl bg-app-green/30 flex items-center justify-center mx-auto mb-5">
                    <Send className="w-8 h-8 text-green-700" />
                  </div>
                  <h3 className="text-xl font-bold text-app-jet mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-sm text-app-jet/60 mb-6">
                    Thank you for reaching out. Our team will get back to you
                    within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl bg-white border border-app-green/40 p-6 md:p-8 shadow-sm space-y-5"
                >
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-app-jet mb-1.5">
                      Full Name <span className="text-app-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Your full name"
                      className={cn(
                        "w-full rounded-xl border bg-app-bg px-4 py-2.5 text-sm text-app-jet placeholder:text-app-jet/40 outline-none focus:ring-2 focus:ring-app-red/30 transition-all",
                        errors.name
                          ? "border-app-red/50"
                          : "border-app-green/30 focus:border-app-red/40"
                      )}
                    />
                    {errors.name && (
                      <p className="text-xs text-app-red mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-app-jet mb-1.5">
                      Email Address <span className="text-app-red">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="you@example.com"
                      className={cn(
                        "w-full rounded-xl border bg-app-bg px-4 py-2.5 text-sm text-app-jet placeholder:text-app-jet/40 outline-none focus:ring-2 focus:ring-app-red/30 transition-all",
                        errors.email
                          ? "border-app-red/50"
                          : "border-app-green/30 focus:border-app-red/40"
                      )}
                    />
                    {errors.email && (
                      <p className="text-xs text-app-red mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-app-jet mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, subject: e.target.value }))
                      }
                      placeholder="What is this about?"
                      className="w-full rounded-xl border border-app-green/30 bg-app-bg px-4 py-2.5 text-sm text-app-jet placeholder:text-app-jet/40 outline-none focus:ring-2 focus:ring-app-red/30 focus:border-app-red/40 transition-all"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-app-jet mb-1.5">
                      Message <span className="text-app-red">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, message: e.target.value }))
                      }
                      placeholder="Describe your question or issue..."
                      className={cn(
                        "w-full rounded-xl border bg-app-bg px-4 py-2.5 text-sm text-app-jet placeholder:text-app-jet/40 outline-none focus:ring-2 focus:ring-app-red/30 transition-all resize-none",
                        errors.message
                          ? "border-app-red/50"
                          : "border-app-green/30 focus:border-app-red/40"
                      )}
                    />
                    {errors.message && (
                      <p className="text-xs text-app-red mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    loading={isSubmitting}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-app-red bg-app-red/10 px-4 py-1.5 rounded-full mb-4">
                FAQ
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-app-jet mb-6">
                Frequently Asked{" "}
                <span className="text-app-red">Questions</span>
              </h2>

              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-2xl bg-white border border-app-green/30 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <span className="text-sm font-semibold text-app-jet flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-app-red flex-shrink-0" />
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-app-jet/40 transition-transform flex-shrink-0",
                          openFaq === i && "rotate-180"
                        )}
                      />
                    </button>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 pb-4"
                      >
                        <p className="text-sm text-app-jet/60 leading-relaxed pl-6">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
