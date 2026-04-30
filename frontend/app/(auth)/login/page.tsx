import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — SafeTrack",
  description: "Sign in to your SafeTrack parent dashboard.",
};

import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to monitor your children&apos;s safety"
    >
      <LoginForm />
    </AuthCard>
  );
}
