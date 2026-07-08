import React, { useState } from 'react';
import api, { BASE_URL } from '../utils/auth';
import { Eye, EyeOff, Heart, Sparkles } from 'lucide-react';
import MemoraLoaderOverlay from '../components/MemoraLoader';

const SignupPage = () => {
  const [formData, setFormData] = useState({ fullname: '', username: '', email: '', password: '' });
  const [registerError, setRegisterError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formData.fullname || !formData.username || !formData.email || !formData.password) {
      setRegisterError('Please fill in all fields');
      return;
    }

    setRegisterError('');
    setSuccess('');

    try {
      setLoading(true);
      await api.post('/auth/register', formData);
      setSuccess('Account created. Taking you to your dashboard...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1400);
    } catch (err) {
      setLoading(false);
      setRegisterError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.response?.statusText ||
          err.message ||
          'Something went wrong. Please check your details and try again.',
      );
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-2xl bg-purple-50 border-2 border-purple-100 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-100 text-sm transition-all';

  return (
    <>
      {loading && <MemoraLoaderOverlay message="Creating your Memora account" />}
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#fdf0f9 0%,#f0ebff 45%,#e8f4ff 100%)' }}
      >
        <div
          className="absolute -top-28 -right-24 w-80 h-80 rounded-full opacity-35 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,#f9a8d4,transparent)' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,#a5b4fc,transparent)' }}
        />

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-6">
            <span
              className="chewy text-4xl"
              style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Memora <Heart size={20} className="inline text-pink-400" />
            </span>
          </div>

          <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-white overflow-hidden">
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd)' }} />

            <div className="p-8 space-y-5">
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                    <Sparkles size={20} className="text-pink-400" />
                  </div>
                </div>
                <h2 className="chewy text-3xl text-purple-800 mb-1">Create your account</h2>
                <p className="text-sm text-purple-400 font-medium">Start keeping your memories in one place.</p>
              </div>

              {registerError && (
                <div className="bg-pink-50 border-2 border-pink-200 text-pink-700 px-4 py-3 rounded-2xl text-sm flex justify-between items-center">
                  <span>{registerError}</span>
                  <button onClick={() => setRegisterError('')} className="ml-3 font-bold text-lg text-pink-400 hover:text-pink-600 flex-shrink-0">
                    ×
                  </button>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm text-center font-semibold">
                  {success}
                </div>
              )}

              <a
                href={`${BASE_URL}/auth/google`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-semibold text-sm border-2 transition-all hover:scale-[1.01] hover:shadow-md"
                style={{ background: '#f0f4ff', borderColor: '#c7d7ff', color: '#4f6ef7' }}
              >
                <svg viewBox="0 0 48 48" className="w-5 h-5" fill="#4f6ef7">
                  <path d="M44.5 20H24v8.5h11.8C34.5 32.9 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 3l6.4-6.4C34.4 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.6 0 20.2-7.7 21-21 .1-.7.1-1.3.1-2z" />
                </svg>
                Continue with Google
              </a>

              <div className="flex items-center gap-3 text-purple-300 text-xs">
                <div className="flex-1 h-px bg-purple-100" />
                <span>or use your email</span>
                <div className="flex-1 h-px bg-purple-100" />
              </div>

              <form onSubmit={handleSignup} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-purple-500 mb-1.5 ml-1 uppercase tracking-wider">Full Name</label>
                  <input id="fullname" type="text" placeholder="Your full name" value={formData.fullname} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-500 mb-1.5 ml-1 uppercase tracking-wider">Username</label>
                  <input id="username" type="text" placeholder="@username" value={formData.username} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-500 mb-1.5 ml-1 uppercase tracking-wider">Email</label>
                  <input id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-500 mb-1.5 ml-1 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} className={inputClass + ' pr-11'} />
                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-3.5 flex items-center text-purple-400 hover:text-purple-600 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 mt-2 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
                  <Heart size={16} className="text-pink-200" /> Create account
                </button>
              </form>

              <p className="text-center text-sm text-purple-400">
                Already have an account?{' '}
                <a href="/login" className="text-purple-600 font-bold hover:text-pink-500 transition-colors underline underline-offset-2">Sign in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
