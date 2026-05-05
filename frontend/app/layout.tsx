import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "sonner";

const displayFont = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SafeTrack — Child Safety Monitoring Dashboard",
  description:
    "Real-time child safety tracking and monitoring platform for concerned parents.",
  keywords: [
    "child safety",
    "GPS tracking",
    "parental control",
    "location monitoring",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} font-sans antialiased bg-app-bg text-app-jet`}
      >
        <AuthProvider>
          <SocketProvider>
            <Toaster position="top-right" richColors />
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
