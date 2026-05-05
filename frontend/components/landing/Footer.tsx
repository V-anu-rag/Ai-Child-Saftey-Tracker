"use client";

import Link from "next/link";
import { Shield, Twitter, Github, Linkedin } from "lucide-react";
import { comingSoon } from "@/lib/utils";

const links: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "#" },
    { label: "Changelog", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "#" },
    { label: "COPPA", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "/contact" },
    { label: "Status", href: "#" },
    { label: "Community", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#050810] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-10 pb-10 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-app-red flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Safe<span className="text-app-red">Track</span>
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Real-time child safety monitoring trusted by over 50,000 families
              worldwide. Keeping kids safe since 2023.
            </p>
            <div className="flex gap-4 mt-6">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <button
                  key={i}
                  onClick={comingSoon}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-app-red transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.href.startsWith("/") || (item.href.startsWith("#") && item.href.length > 1) ? (
                      <Link
                        href={item.href}
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        onClick={comingSoon}
                        className="text-sm text-white/50 hover:text-white transition-colors text-left"
                      >
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} SafeTrack, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-white/40">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
