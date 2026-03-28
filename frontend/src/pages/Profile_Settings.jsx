import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { Camera, Bell, Moon, Lock, Star } from 'lucide-react';
import axios from 'axios';
import { compressImage } from '../utils/compressImage';

const achievements = [
  { label: 'Explorer ✨', level: 3, progress: 9,  total: 10, color: '#f59e0b', bg: 'bg-amber-100' },
  { label: 'Mentor 🌸',   level: 2, progress: 2,  total: 3,  color: '#10b981', bg: 'bg-emerald-100' },
  { label: 'Expert ⭐',   level: 1, progress: 2,  total: 5,  color: '#8b5cf6', bg: 'bg-violet-100' },
];

const inputCls = "w-full p-3 rounded-2xl bg-purple-50 border border-purple-100 text-purple-900 placeholder:text-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm transition";

export default function ProfileSettingsPage({ onClose }) {
  const [profile, setProfile] = useState({ fullname:'', username:'', email:'', bio:'', avatar:'', newAvatarFile: null });
  const [settings, setSettings] = useState({ notifications: true, darkMode: false, password: '' });
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [showSettingsSuccess, setShowSettingsSuccess] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return setLoadingUser(false);
        const res = await axios.get('http://localhost:5000/api/auth/details', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { fullname, username, email, bio, avatar } = res.data.user;
        setProfile({ fullname, username, email, bio, avatar, newAvatarFile: null });
      } catch (err) {
        localStorage.removeItem('token');
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch('http://localhost:5000/api/auth/profile',
        { fullname: profile.fullname, username: profile.username, email: profile.email, bio: profile.bio, avatar: profile.avatar },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const u = res.data.user;
      setProfile({ fullname: u.fullname, username: u.username, email: u.email, bio: u.bio, avatar: u.avatar, newAvatarFile: null });
      setShowProfileSuccess(true);
      setTimeout(() => setShowProfileSuccess(false), 2500);
    } catch (err) { console.error('Failed to save profile', err); }
  };

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:5000/api/auth/profile',
        { notifications: settings.notifications, darkMode: settings.darkMode, password: settings.password || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSettings(s => ({ ...s, password: '' }));
      setShowSettingsSuccess(true);
      setTimeout(() => setShowSettingsSuccess(false), 2500);
    } catch (err) { console.error('Failed to save settings', err); }
  };

  if (loadingUser) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(160deg,#fce4f3,#ede9ff,#dbeafe)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-pink-300 border-t-pink-600 animate-spin" />
        <p className="text-purple-400 text-sm animate-pulse">Loading profile… 🌸</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 relative"
      style={{ background: "linear-gradient(160deg,#fce4f3 0%,#ede9ff 40%,#dbeafe 100%)" }}>

      {/* Back button */}
      <button onClick={onClose} className="absolute top-5 left-5 flex items-center gap-2 text-purple-500 hover:text-purple-700 font-semibold text-sm transition-colors">
        <FaArrowLeft size={16} /> Back
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-6">
          <h1 className="chewy text-4xl text-purple-700 mb-1">My Profile ✨</h1>
          <p className="text-sm text-purple-400">Customise your Memora experience 🌸</p>
        </div>

        {/* Avatar hero */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 shadow-xl"
              style={{ ringColor: "#f9a8d4" }}>
              <img src={profile.avatar || '/default-avatar.png'} alt="avatar"
                className="w-full h-full object-cover" />
            </div>
            <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 border-white transition-all hover:scale-110"
              style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}>
              <Camera size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden"
                onChange={async e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    const dataUrl = await compressImage(file, 200, 200, 0.6);
                    setProfile(p => ({ ...p, avatar: dataUrl, newAvatarFile: file }));
                  } catch {}
                }} />
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {[
            { id: 'profile',  label: '🧸 Profile'      },
            { id: 'settings', label: '⚙️ Settings'     },
            { id: 'achieve',  label: '🏆 Achievements' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-2xl text-sm font-semibold transition-all ${activeTab === tab.id
                ? 'text-white shadow-md scale-105'
                : 'bg-white/60 text-purple-500 hover:bg-white/80'}`}
              style={activeTab === tab.id ? { background: "linear-gradient(135deg,#ec4899,#8b5cf6)" } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/80 overflow-hidden">
          <div className="h-1.5" style={{ background: "linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd)" }} />
          <div className="p-7">

            {/* Profile tab */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h2 className="chewy text-2xl text-purple-700 mb-4">Edit your details 🌷</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-purple-500 mb-1 ml-1">Full name</label>
                    <input type="text" placeholder="Your full name" value={profile.fullname}
                      onChange={e => setProfile(p => ({ ...p, fullname: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-purple-500 mb-1 ml-1">Username</label>
                    <input type="text" placeholder="@username" value={profile.username}
                      onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-500 mb-1 ml-1">Email</label>
                  <input type="email" placeholder="your@email.com" value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-500 mb-1 ml-1">Bio ✦</label>
                  <textarea rows={3} placeholder="Tell us a little about yourself…" value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} className={inputCls} />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={saveProfile}
                    className="px-6 py-2.5 rounded-2xl text-white font-bold text-sm shadow-md hover:scale-105 hover:shadow-lg transition-all"
                    style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}>
                    Save changes ♡
                  </button>
                  {showProfileSuccess && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
                      <FaCheckCircle size={18} /> Saved!
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Settings tab */}
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <h2 className="chewy text-2xl text-purple-700 mb-4">Preferences ⚙️</h2>

                {[
                  { name: 'notifications', icon: <Bell size={16} />, label: 'Notifications', sub: 'Get notified when capsules unlock' },
                  { name: 'darkMode',      icon: <Moon size={16} />, label: 'Dark Mode',      sub: 'Switch to a darker theme' },
                ].map(s => (
                  <div key={s.name} className="flex items-center justify-between bg-purple-50 rounded-2xl px-4 py-3.5 border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-purple-500"
                        style={{ background: "linear-gradient(135deg,#fdf4ff,#ede9ff)" }}>
                        {s.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-purple-800">{s.label}</p>
                        <p className="text-xs text-purple-400">{s.sub}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name={s.name} checked={settings[s.name]}
                        onChange={e => setSettings(p => ({ ...p, [e.target.name]: e.target.checked }))}
                        className="sr-only peer" />
                      <div className="w-10 h-5 bg-purple-200 rounded-full peer peer-checked:bg-pink-400 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-purple-500 mb-1 ml-1 flex items-center gap-1"><Lock size={11}/> New Password</label>
                  <input type="password" name="password" placeholder="Leave blank to keep current" value={settings.password}
                    onChange={e => setSettings(p => ({ ...p, password: e.target.value }))} className={inputCls} />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button onClick={saveSettings}
                    className="px-6 py-2.5 rounded-2xl text-white font-bold text-sm shadow-md hover:scale-105 hover:shadow-lg transition-all"
                    style={{ background: "linear-gradient(135deg,#10b981,#3b82f6)" }}>
                    Save settings ✓
                  </button>
                  {showSettingsSuccess && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
                      <FaCheckCircle size={18} /> Saved!
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Achievements tab */}
            {activeTab === 'achieve' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="chewy text-2xl text-purple-700 mb-6">Your Achievements 🏆</h2>
                <div className="space-y-5">
                  {achievements.map((a, i) => (
                    <div key={i} className={`${a.bg} rounded-2xl p-5 border border-white shadow-sm`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-bold text-gray-800">{a.label}</span>
                          <span className="ml-2 text-xs bg-white/70 text-gray-500 px-2 py-0.5 rounded-full">Level {a.level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(a.level)].map((_, j) => <Star key={j} size={12} className="fill-current text-yellow-400" />)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 rounded-full bg-white/60 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${(a.progress / a.total) * 100}%`, background: a.color }} />
                        </div>
                        <span className="text-xs text-gray-500 font-medium shrink-0">{a.progress}/{a.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-6 text-sm text-purple-500 hover:text-purple-700 font-semibold transition-colors">
                  View all achievements →
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
