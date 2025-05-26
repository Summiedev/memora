import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { compressImage } from '../utils/compressImage';

const achievements = [
  { label: 'Explorer', level: 3, progress: 9, total: 10, color: 'bg-yellow-400' },
  { label: 'Mentor', level: 2, progress: 2, total: 3, color: 'bg-green-400' },
  { label: 'Expert', level: 1, progress: 2, total: 5, color: 'bg-orange-400' },
];

export default function ProfileSettingsPage({ onClose }) {

 const [profile, setProfile] = useState({
   fullname:     '',
   username:     '',
   email:        '',
   bio:          '',
   avatar:       '',    // will hold Data URL
   newAvatarFile: null  // optional File object
 });

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    password: '',
  });

  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [showSettingsSuccess, setShowSettingsSuccess] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return setLoadingUser(false);

        const res = await axios.get('http://localhost:5000/api/auth/details', {
          headers: { Authorization: `Bearer ${token}` },
        });

       const { fullname, username, email, bio, avatar } = res.data.user;
       console.log('Fetched user:', res.data.user);
 setProfile({
   fullname,
   username,
  email,
   bio,
   avatar,
  newAvatarFile: null
 });
      } catch (err) {
        console.error('Error fetching user:', err);
        localStorage.removeItem('token');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSettingsChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSettings({ ...settings, [name]: type === 'checkbox' ? checked : value });
  };

 
 const saveProfile = async () => {
 
    try {
    const token = localStorage.getItem('token');
    const payload = {
      fullname: profile.fullname,
      username: profile.username,
      email:    profile.email,
      bio:      profile.bio,
      avatar:   profile.avatar    // Data URL
    };

    const res = await axios.patch(
      'http://localhost:5000/api/auth/profile',
      payload,
      { headers: { Authorization: `Bearer ${token}` }}
    );

    // update local state from returned user
    const u = res.data.user;
    setProfile({
      fullname: u.fullname,
      username: u.username,
      email:    u.email,
      bio:      u.bio,
      avatar:   u.avatar,
      newAvatarFile: null
    });

    setShowProfileSuccess(true);
    setTimeout(() => setShowProfileSuccess(false), 2000);
  } catch (err) {
    console.error('Failed to save profile', err);
  }
 };
 const saveSettings = async () => {
   try {
     const token = localStorage.getItem('token');
     const payload = {
       notifications: settings.notifications,
       darkMode:      settings.darkMode,
       password:      settings.password || undefined
     };

     await axios.patch(
       'http://localhost:5000/api/auth/profile',
       payload,
       { headers: { Authorization: `Bearer ${token}` } }
     );

     // clear out password field
     setSettings(s => ({ ...s, password: '' }));

     setShowSettingsSuccess(true);
     setTimeout(() => setShowSettingsSuccess(false), 2000);
   } catch (err) {
     console.error('Failed to save settings', err);
   }
 };
  if (loadingUser) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-blue-500 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen quicksand bg-blue-100 py-6 px-4 sm:px-8 relative">
      <button
        onClick={onClose}
        className="absolute top-4 left-4 text-blue-500 hover:text-blue-700 transition"
      >
        <FaArrowLeft size={20} />
      </button>

      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 text-black lg:grid-cols-3 gap-0">
          {/* Left 2/3: Profile + Settings */}
          <div className="col-span-2 p-8 space-y-8">
            {/* Profile Section */}
            <div>
              <h2 className="text-xl text-font-bold text-blue-700 mb-4">🧸 Edit Profile</h2>
              <div className="flex items-center gap-4 mb-4">
                 <motion.img
  src={profile.avatar || '/default-avatar.png'}
   alt="avatar"
   className="w-20 h-20 rounded-full object-cover border-4 border-blue-300 shadow-md"
/>
             <input
                type="file"
                accept="image/*"
                onChange={async e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    // compress to ~200×200 @60% JPEG
                    const dataUrl = await compressImage(file, 200, 200, 0.6);
                    setProfile(p => ({
                      ...p,
                      avatar: dataUrl,
                      newAvatarFile: file
                   }));
                  } catch (err) {
                    console.error('Image compression failed', err);
                  }
                }}
                className="w-full text-sm"
              />
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={profile.fullname}
                   onChange={e => setProfile(p => ({ ...p, fullname: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 placeholder:text-blue-400"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={profile.username}
                   onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 placeholder:text-blue-400"
                />
              <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={profile.email}
                   onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 placeholder:text-blue-400"
                />
                <textarea
                  name="bio"
                  rows="3"
                  placeholder="Bio"
                  value={profile.bio}
                  onChange={handleProfileChange}
                  className="w-full p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 placeholder:text-blue-400"
                />
              </div>

              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={saveProfile}
                  className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-5 rounded-xl transition"
                >
                  Save Profile
                </button>
                {showProfileSuccess && (
                  <FaCheckCircle className="text-green-500" size={28} />
                )}
              </div>
            </div>

            {/* Settings Section */}
            <div>
              <h2 className="text-xl font-bold text-blue-700 mb-4">⚙️ Settings</h2>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-blue-600 font-medium">Enable Notifications</label>
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={settings.notifications}
                    onChange={handleSettingsChange}
                    className="accent-blue-400 w-5 h-5 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-blue-600 font-medium">Dark Mode</label>
                  <input
                    type="checkbox"
                    name="darkMode"
                    checked={settings.darkMode}
                    onChange={handleSettingsChange}
                    className="accent-blue-400 w-5 h-5 rounded"
                  />
                </div>

                <div>
                  <label className="block text-blue-600 font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={settings.password}
                    onChange={handleSettingsChange}
                    className="w-full p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 placeholder:text-blue-400"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={saveSettings}
                  className="bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-5 rounded-xl transition"
                >
                  Save Settings
                </button>
                {showSettingsSuccess && (
                  <FaCheckCircle className="text-green-500" size={28} />
                )}
              </div>
            </div>
          </div>

          {/* Right 1/3: Achievements */}
          <div className="bg-blue-50 p-6 border-l border-blue-200 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-4">🎖️ Achievements</h3>
              {achievements.map((achieve, idx) => (
                <div key={idx} className="mb-5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-blue-700 font-medium">
                      {achieve.label} <span className="text-xs">(Level {achieve.level})</span>
                    </span>
                    <span className="text-xs text-gray-500">{achieve.progress}/{achieve.total}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${achieve.color}`}
                      style={{
                        width: `${(achieve.progress / achieve.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="text-blue-500 text-sm underline hover:text-blue-700 mt-4">
              Show all achievements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
