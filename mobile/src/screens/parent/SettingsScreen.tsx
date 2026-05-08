import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/theme";

type TabType = "profile" | "security" | "notifications" | "privacy";

export default function SettingsScreen({ navigation, route }: any) {
  const { user, updateUser, logout } = useAuth();
  const userInitial = user?.name?.charAt(0) || "U";

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [formData, setFormData] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  
  // Notification states (mock functionality like web)
  const [notifs, setNotifs] = useState({
    email: true,
    push: true,
    weekly: false
  });

  useEffect(() => {
    if (route.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route.params?.tab]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      return Alert.alert("Error", "Name and email cannot be empty");
    }
    setLoading(true);
    try {
      await updateUser(formData);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      return Alert.alert("Error", "Please fill in all password fields");
    }
    if (passwordData.newPassword.length < 8) {
      return Alert.alert("Error", "Password must be at least 8 characters");
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }

    setLoading(true);
    try {
      await updateUser({ password: passwordData.newPassword });
      setPasswordData({ newPassword: "", confirmPassword: "" });
      Alert.alert("Success", "Password updated successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <View style={styles.card}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarTextLarge}>{userInitial}</Text>
            </View>
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput 
                style={styles.input} 
                value={formData.name} 
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textMuted}
              />
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput 
                style={styles.input} 
                value={formData.email} 
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textMuted}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Profile Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        );
      case "security":
        return (
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Change Password</Text>
            <Text style={styles.cardSub}>Ensure your account stays secure.</Text>
            
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput 
                style={styles.input} 
                value={passwordData.newPassword} 
                onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                secureTextEntry
                placeholder="Minimum 8 characters"
                placeholderTextColor={COLORS.textMuted}
              />
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput 
                style={styles.input} 
                value={passwordData.confirmPassword} 
                onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                secureTextEntry
                placeholder="Repeat new password"
                placeholderTextColor={COLORS.textMuted}
              />
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.primary }]} onPress={handlePasswordChange} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
              </TouchableOpacity>
              <View style={styles.infoBox}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                <Text style={styles.infoText}>You will stay logged in on this device after the update.</Text>
              </View>
            </View>
          </View>
        );
      case "notifications":
        return (
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Notifications</Text>
            <Text style={styles.cardSub}>Manage how you receive alerts.</Text>

            <View style={styles.toggleList}>
              <View style={styles.toggleItem}>
                <View style={styles.toggleText}>
                  <Text style={styles.toggleLabel}>Email Alerts</Text>
                  <Text style={styles.toggleDesc}>Critical alerts sent to your inbox.</Text>
                </View>
                <Switch 
                  value={notifs.email} 
                  onValueChange={(val) => setNotifs({ ...notifs, email: val })}
                  trackColor={{ false: COLORS.green, true: `${COLORS.salmon}50` }}
                  thumbColor={notifs.email ? COLORS.salmon : "#9ca3af"}
                />
              </View>
              <View style={styles.separator} />
              <View style={styles.toggleItem}>
                <View style={styles.toggleText}>
                  <Text style={styles.toggleLabel}>Push Notifications</Text>
                  <Text style={styles.toggleDesc}>Instant pop-ups on this device.</Text>
                </View>
                <Switch 
                  value={notifs.push} 
                  onValueChange={(val) => setNotifs({ ...notifs, push: val })}
                  trackColor={{ false: COLORS.green, true: `${COLORS.salmon}50` }}
                  thumbColor={notifs.push ? COLORS.salmon : "#9ca3af"}
                />
              </View>
              <View style={styles.separator} />
              <View style={styles.toggleItem}>
                <View style={styles.toggleText}>
                  <Text style={styles.toggleLabel}>Weekly Reports</Text>
                  <Text style={styles.toggleDesc}>Summary of activity every Monday.</Text>
                </View>
                <Switch 
                  value={notifs.weekly} 
                  onValueChange={(val) => setNotifs({ ...notifs, weekly: val })}
                  trackColor={{ false: COLORS.green, true: `${COLORS.salmon}50` }}
                  thumbColor={notifs.weekly ? COLORS.salmon : "#9ca3af"}
                />
              </View>
            </View>
          </View>
        );
      case "privacy":
        return (
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Privacy & Data</Text>
            <Text style={styles.cardSub}>Your data security is our priority.</Text>

            <View style={styles.privacyContent}>
              <View style={styles.privacyBox}>
                <Text style={styles.privacyTitle}>Data Encryption</Text>
                <Text style={styles.privacyText}>
                  All location data is encrypted in transit and at rest. We purge location history every 30 days.
                </Text>
              </View>
              <TouchableOpacity style={styles.outlineBtn}>
                <Text style={styles.outlineBtnText}>View Privacy Policy</Text>
              </TouchableOpacity>
              
              <View style={styles.dangerZone}>
                <Text style={styles.dangerTitle}>Danger Zone</Text>
                <TouchableOpacity style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>Delete Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.jet} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TabButton label="Profile" active={activeTab === "profile"} onPress={() => setActiveTab("profile")} />
          <TabButton label="Security" active={activeTab === "security"} onPress={() => setActiveTab("security")} />
          <TabButton label="Notifications" active={activeTab === "notifications"} onPress={() => setActiveTab("notifications")} />
          <TabButton label="Privacy" active={activeTab === "privacy"} onPress={() => setActiveTab("privacy")} />
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {renderTabContent()}

        <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
          <View style={[styles.iconBox, { backgroundColor: "rgba(255, 77, 77, 0.1)" }]}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          </View>
          <Text style={[styles.settingText, { color: COLORS.danger }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) {
  return (
    <TouchableOpacity 
      style={[styles.tab, active && styles.activeTab]} 
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.green },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.jet },
  tabsContainer: { backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.green },
  tabsScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: "transparent" },
  activeTab: { backgroundColor: "#fff", shadowColor: COLORS.jet, shadowOpacity: 0.04, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: COLORS.green },
  tabText: { fontSize: 14, fontWeight: "700", color: COLORS.textMuted },
  activeTabText: { color: COLORS.primary },
  scroll: { padding: 20 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 24, alignItems: "center", marginBottom: 20, shadowColor: COLORS.jet, shadowOpacity: 0.04, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: COLORS.green },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginBottom: 16, borderWidth: 4, borderColor: "#fff", shadowColor: COLORS.primary, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  avatarTextLarge: { color: "#fff", fontSize: 32, fontWeight: "800" },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(99, 91, 255, 0.08)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: "800", color: COLORS.jet, marginBottom: 4 },
  cardSub: { fontSize: 13, color: COLORS.textMuted, marginBottom: 20, textAlign: "center" },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, marginLeft: 8 },
  settingItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.green, shadowColor: COLORS.jet, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 16 },
  settingText: { flex: 1, fontSize: 16, fontWeight: "600", color: COLORS.jet },
  logoutItem: { marginTop: 8, borderWidth: 1, borderColor: "rgba(255, 77, 77, 0.2)" },
  formContainer: { width: "100%" },
  inputLabel: { fontSize: 11, fontWeight: "800", color: COLORS.textMuted, marginBottom: 6, textTransform: "uppercase", marginLeft: 4 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.green, borderRadius: 14, padding: 14, fontSize: 15, color: COLORS.jet, marginBottom: 16, fontWeight: "600" },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8, shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  infoBox: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16, backgroundColor: "rgba(99, 91, 255, 0.05)", padding: 12, borderRadius: 12 },
  infoText: { fontSize: 11, color: COLORS.textMuted, flex: 1 },
  toggleList: { width: "100%" },
  toggleItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 15, fontWeight: "700", color: COLORS.jet },
  toggleDesc: { fontSize: 12, color: COLORS.textMuted },
  separator: { height: 1, backgroundColor: COLORS.green },
  privacyContent: { width: "100%", gap: 20 },
  privacyBox: { backgroundColor: "rgba(10, 15, 30, 0.02)", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.green },
  privacyTitle: { fontSize: 14, fontWeight: "800", color: COLORS.jet, marginBottom: 6 },
  privacyText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  outlineBtn: { borderWidth: 1, borderColor: COLORS.green, backgroundColor: "#fff", borderRadius: 12, padding: 12, alignItems: "center" },
  outlineBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.jet },
  dangerZone: { marginTop: 12, gap: 12 },
  dangerTitle: { fontSize: 14, fontWeight: "800", color: COLORS.danger },
  deleteBtn: { borderWidth: 1, borderColor: "rgba(255, 77, 77, 0.2)", borderRadius: 12, padding: 12, alignItems: "center", backgroundColor: "rgba(255, 77, 77, 0.02)" },
  deleteBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.danger },
});
