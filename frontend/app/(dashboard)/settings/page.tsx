"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Trash2, 
  Save, 
  Mail, 
  CheckCircle2,
  AlertCircle,
  Eye,
  Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/common/Button";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { cn } from "@/lib/utils";

type TabType = "profile" | "security" | "notifications" | "privacy";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      await authAPI.updateMe(profileData);
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      await authAPI.updateMe({ password: passwordData.newPassword });
      setSuccess("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-app-jet flex items-center gap-3">
          <Settings className="w-7 h-7 text-app-red" />
          Settings
        </h2>
        <p className="text-sm text-app-jet/50 mt-1 ml-10">Manage your account preferences and security settings.</p>
      </div>

      <AnimatePresence mode="wait">
        {success && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 overflow-hidden"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 overflow-hidden"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Navigation Tabs Sidebar */}
        <div className="space-y-1">
          <SettingsTab 
            icon={User} 
            label="Profile" 
            active={activeTab === "profile"} 
            onClick={() => setActiveTab("profile")} 
          />
          <SettingsTab 
            icon={Lock} 
            label="Security" 
            active={activeTab === "security"} 
            onClick={() => setActiveTab("security")} 
          />
          <SettingsTab 
            icon={Bell} 
            label="Notifications" 
            active={activeTab === "notifications"} 
            onClick={() => setActiveTab("notifications")} 
          />
          <SettingsTab 
            icon={Shield} 
            label="Privacy" 
            active={activeTab === "privacy"} 
            onClick={() => setActiveTab("privacy")} 
          />
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <SectionWrapper title="Personal Information" icon={User}>
                  <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold text-app-jet/60 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full bg-app-bg border border-app-green/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-app-red/40 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold text-app-jet/60 uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-jet/30" />
                        <input 
                          type="email" 
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full bg-app-bg border border-app-green/20 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-app-red/40 transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button type="submit" loading={loading} leftIcon={<Save className="w-4 h-4" />}>
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </SectionWrapper>

                {/* Danger Zone */}
                <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100 mt-12">
                  <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Danger Zone
                  </h3>
                  <p className="text-xs text-app-jet/60 mt-1 mb-6 max-w-md">
                    Permanently delete your account and all associated child safety data. This action is irreversible.
                  </p>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 bg-white">
                    Delete Account
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SectionWrapper title="Security Settings" icon={Lock}>
                  <form onSubmit={handleChangePassword} className="space-y-6 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-xs font-bold text-app-jet/60 uppercase tracking-wider">New Password</label>
                        <input 
                          type="password" 
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full bg-app-bg border border-app-green/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-app-red/40 transition-colors"
                          placeholder="At least 8 characters"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-bold text-app-jet/60 uppercase tracking-wider">Confirm New Password</label>
                        <input 
                          type="password" 
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full bg-app-bg border border-app-green/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-app-red/40 transition-colors"
                          placeholder="Repeat new password"
                        />
                      </div>
                    </div>
                    <div className="bg-app-bg/50 p-4 rounded-xl border border-dashed border-app-green/30">
                      <p className="text-xs text-app-jet/50 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-app-red" />
                        Changing your password will require you to log in again on all your devices.
                      </p>
                    </div>
                    <Button type="submit" loading={loading} variant="outline" leftIcon={<Shield className="w-4 h-4" />}>
                      Update Password
                    </Button>
                  </form>
                </SectionWrapper>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SectionWrapper title="Notification Preferences" icon={Bell}>
                  <div className="space-y-4 pt-4">
                    <ToggleItem 
                      title="Email Alerts" 
                      description="Receive critical alerts via email when your child leaves a safe zone or presses SOS." 
                      defaultChecked 
                    />
                    <div className="h-px bg-app-green/5 mx-2" />
                    <ToggleItem 
                      title="Desktop Notifications" 
                      description="Show instant pop-up alerts on your dashboard when activity occurs." 
                      defaultChecked 
                    />
                    <div className="h-px bg-app-green/5 mx-2" />
                    <ToggleItem 
                      title="Weekly Activity Reports" 
                      description="A detailed summary of your children's movements and safety status delivered every Monday." 
                    />
                  </div>
                </SectionWrapper>
              </motion.div>
            )}

            {activeTab === "privacy" && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SectionWrapper title="Privacy & Data" icon={Shield}>
                  <div className="space-y-6 pt-4 text-app-jet/70">
                    <div className="bg-app-bg p-5 rounded-2xl border border-app-green/10">
                      <h4 className="text-sm font-bold text-app-jet mb-2">Location Data Storage</h4>
                      <p className="text-xs leading-relaxed">
                        Your child's location data is encrypted and stored for a maximum of 30 days. After this period, it is automatically purged from our servers.
                      </p>
                    </div>
                    
                    <ToggleItem 
                      title="Anonymous Analytics" 
                      description="Help us improve SafeTrack by sharing non-identifiable usage data." 
                      defaultChecked 
                    />
                    
                    <div className="pt-4">
                      <Button variant="outline" leftIcon={<Eye className="w-4 h-4" />}>
                        View Privacy Policy
                      </Button>
                    </div>
                  </div>
                </SectionWrapper>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ 
  icon: Icon, 
  label, 
  active = false,
  onClick
}: { 
  icon: any, 
  label: string, 
  active?: boolean,
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all relative group",
        active 
          ? "bg-white text-app-red shadow-sm border border-app-red/10" 
          : "text-app-jet/40 hover:bg-white/50 hover:text-app-jet"
      )}
    >
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute left-0 w-1 h-6 bg-app-red rounded-r-full"
        />
      )}
      <Icon className={cn(
        "w-4 h-4 transition-colors",
        active ? "text-app-red" : "text-app-jet/30 group-hover:text-app-jet/60"
      )} />
      {label}
    </button>
  );
}

function ToggleItem({ title, description, defaultChecked = false }: { title: string, description: string, defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-6 py-2 px-1">
      <div className="flex-1">
        <p className="text-sm font-bold text-app-jet">{title}</p>
        <p className="text-[11px] text-app-jet/50 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={cn(
          "w-10 h-5 rounded-full relative transition-colors shrink-0",
          checked ? "bg-app-red" : "bg-app-jet/10"
        )}
      >
        <div className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
          checked ? "left-5.5" : "left-0.5"
        )} />
      </button>
    </div>
  );
}
