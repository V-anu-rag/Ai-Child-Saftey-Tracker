import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Parent Account — SafeTrack",
  description: "Join SafeTrack to start monitoring your children's safety and real-time location.",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Create Account"
      subtitle="Join SafeTrack and keep your family safe with real-time tracking"
    >
      <SignupForm />
    </AuthCard>
  );
}
