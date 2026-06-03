import { Layout } from "../components/syntax/layout";
import { useState } from "react";
import { userAPI, authAPI } from "../services/api";
import { useAuthStore } from "../store/analysisStore";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const tabs = ["Profile", "Preferences", "Editor", "Notifications", "Account"];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl mb-6">Settings</h1>
        <div className="flex gap-6">
          <div className="w-48 space-y-1">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2 text-sm rounded ${activeTab === tab ? "bg-primary text-white" : "text-slate-300 hover:bg-[#334155]"}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1">
            {activeTab === "Profile" && <ProfileSettings />}
            {activeTab === "Preferences" && <PreferencesSettings />}
            {activeTab === "Editor" && <EditorSettings />}
            {activeTab === "Notifications" && <NotificationsSettings />}
            {activeTab === "Account" && <AccountSettings />}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ProfileSettings() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", bio: user?.bio || "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile({ name: form.name, bio: form.bio });
      setUser(data.data.user);
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile"); } finally { setSaving(false); }
  };

  return (
    <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
      <h2 className="text-lg mb-4">Profile Information</h2>
      <div className="space-y-4">
        {[
          { label: "Full Name", key: "name", type: "text" },
          { label: "Email", key: "email", type: "email" },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-sm text-slate-400 mb-2">{label}</label>
            <input type={type} value={(form as any)[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              disabled={key === "email"}
              className="w-full px-4 py-2 bg-[#0F172A] border border-[#475569] rounded text-white focus:outline-none focus:border-primary disabled:opacity-50" />
          </div>
        ))}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Bio</label>
          <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full px-4 py-2 bg-[#0F172A] border border-[#475569] rounded text-white focus:outline-none focus:border-primary resize-none" />
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 bg-primary hover:bg-primary/90 rounded text-sm disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function PreferencesSettings() {
  const handleSave = async (key: string, value: any) => {
    try { await userAPI.updatePreferences({ [key]: value }); toast.success("Saved!"); }
    catch { toast.error("Failed to save"); }
  };
  return (
    <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
      <h2 className="text-lg mb-4">Preferences</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Default Language</label>
          <select onChange={(e) => handleSave("defaultLanguage", e.target.value)}
            className="w-full px-4 py-2 bg-[#0F172A] border border-[#475569] rounded text-white focus:outline-none focus:border-primary">
            {["javascript","python","cpp","java","c","go"].map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function EditorSettings() {
  return (
    <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
      <h2 className="text-lg mb-4">Editor Settings</h2>
      <div className="space-y-4">
        {[
          { label: "Font Size", options: ["12px","14px","16px","18px"] },
          { label: "Tab Size", options: ["2 spaces","4 spaces","8 spaces"] },
        ].map(({ label, options }) => (
          <div key={label}>
            <label className="block text-sm text-slate-400 mb-2">{label}</label>
            <select className="w-full px-4 py-2 bg-[#0F172A] border border-[#475569] rounded text-white focus:outline-none focus:border-primary">
              {options.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsSettings() {
  return (
    <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
      <h2 className="text-lg mb-4">Notification Preferences</h2>
      <div className="space-y-4">
        {[
          { label: "Email Notifications", desc: "Receive analysis reports via email" },
          { label: "Analysis Complete", desc: "Notify when analysis is ready" },
          { label: "Weekly Summary", desc: "Get weekly analysis summary" },
        ].map(({ label, desc }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b border-[#475569]">
            <div><p className="text-sm text-white">{label}</p><p className="text-xs text-slate-400">{desc}</p></div>
            <label className="relative inline-block w-12 h-6">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-12 h-6 bg-[#475569] rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountSettings() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async () => {
    if (form.newPass !== form.confirm) { toast.error("Passwords don't match"); return; }
    setSaving(true);
    try {
      await userAPI.changePassword(form.current, form.newPass);
      toast.success("Password updated!");
      setForm({ current: "", newPass: "", confirm: "" });
    } catch { toast.error("Failed to change password"); } finally { setSaving(false); }
  };

  const handleLogout = () => { authAPI.logout(); logout(); navigate("/"); };

  return (
    <div className="space-y-6">
      <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
        <h2 className="text-lg mb-4">Change Password</h2>
        <div className="space-y-4">
          {[
            { label: "Current Password", key: "current" },
            { label: "New Password", key: "newPass" },
            { label: "Confirm Password", key: "confirm" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm text-slate-400 mb-2">{label}</label>
              <input type="password" value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-2 bg-[#0F172A] border border-[#475569] rounded text-white focus:outline-none focus:border-primary" />
            </div>
          ))}
          <button onClick={handlePasswordChange} disabled={saving}
            className="px-4 py-2 bg-primary hover:bg-primary/90 rounded text-sm disabled:opacity-50">
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
        <h2 className="text-lg mb-4">Session</h2>
        <button onClick={handleLogout} className="px-4 py-2 bg-[#334155] hover:bg-[#475569] rounded text-sm">
          Sign Out
        </button>
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <h2 className="text-lg mb-4 text-red-400">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div><p className="text-sm text-white">Delete Account</p><p className="text-xs text-slate-400">Permanently delete your account and all data</p></div>
          <button className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-sm">Delete Account</button>
        </div>
      </div>
    </div>
  );
}
