import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import MemoraLoaderOverlay from '../components/MemoraLoader';

const FloatingShape = ({ style, emoji }) => (
  <div className="pointer-events-none absolute text-2xl animate-bounce select-none" style={style}>{emoji}</div>
);

const SignupPage = () => {
  const [formData, setFormData] = useState({ fullname:'', username:'', email:'', password:'' });
  const [registerError, setRegisterError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = e => setFormData(p => ({ ...p, [e.target.id]: e.target.value }));

  const handleSignup = async e => {
    e.preventDefault();
    if (!formData.username || !formData.password) { setRegisterError('All fields are required!'); return; }
    setRegisterError(''); setSuccess('');
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      setSuccess('Welcome to Memora! Redirecting… ✨');
      setTimeout(() => { setLoading(false); window.location.href = '/dashboard'; }, 2000);
    } catch (err) {
      setLoading(false);
      setRegisterError(err.response?.data?.error || 'User already exists. Try another username!');
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-2xl bg-purple-50 border border-purple-100 text-purple-900 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm";

  return (
    <>
      {loading && <MemoraLoaderOverlay />}
      <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg,#fce4f3 0%,#e8d5ff 40%,#c7e8ff 100%)" }}>

        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(circle,#c4b5fd,transparent)" }} />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle,#f9a8d4,transparent)" }} />

        <FloatingShape emoji="🌟" style={{ top:'6%',   left:'5%',   animationDelay:'0s',   animationDuration:'3s'   }} />
        <FloatingShape emoji="🎀" style={{ top:'20%',  right:'7%',  animationDelay:'0.6s', animationDuration:'2.5s' }} />
        <FloatingShape emoji="🌷" style={{ bottom:'10%', left:'8%', animationDelay:'1.1s', animationDuration:'4s'   }} />
        <FloatingShape emoji="💫" style={{ bottom:'20%', right:'5%', animationDelay:'0.3s', animationDuration:'3.5s' }} />

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/90 overflow-hidden">
            <div className="h-2 w-full" style={{ background: "linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd)" }} />
            <div className="p-8 space-y-5">

              <div className="text-center">
                <div className="text-4xl mb-2">🌸</div>
                <h2 className="chewy text-3xl text-purple-700 mb-1">Create your account!</h2>
                <p className="text-sm text-purple-400">Join Memora and start preserving memories ₊˚⊹♡</p>
              </div>

              {registerError && (
                <div className="bg-pink-50 border border-pink-200 text-pink-700 px-4 py-2.5 rounded-2xl text-sm flex justify-between items-center">
                  <span>{registerError}</span>
                  <button onClick={() => setRegisterError('')} className="ml-2 font-bold text-lg leading-none text-pink-400 hover:text-pink-600">×</button>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-2xl text-sm text-center">{success}</div>
              )}

              {/* Social */}
              <div className="flex gap-3">
                <a href="http://localhost:5000/api/auth/google"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-semibold text-sm border transition-all hover:scale-105 hover:shadow-md"
                  style={{ background: "#f0f4ff", borderColor: "#c7d7ff", color: "#4f6ef7" }}>
                  <svg viewBox="0 0 48 48" className="w-5 h-5" fill="#4f6ef7"><path d="M44.5 20H24v8.5h11.8C34.5 32.9 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 3l6.4-6.4C34.4 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.6 0 20.2-7.7 21-21 .1-.7.1-1.3.1-2z"/></svg>
                  Google
                </a>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-semibold text-sm border transition-all hover:scale-105 hover:shadow-md"
                  style={{ background: "#fdf4ff", borderColor: "#e9d5ff", color: "#9333ea" }}>
                  <svg viewBox="0 0 448 512" className="w-4 h-5" fill="#9333ea"><path d="M224 202.66A53.34 53.34 0 1 0 277.34 256 53.38 53.38 0 0 0 224 202.66Zm124.71-41a54 54 0 0 0-30.54-30.54C291.26 124.28 224 124 224 124s-67.26.28-94.17 6.14a54 54 0 0 0-30.54 30.54C93.28 152.74 93 224 93 224s.28 67.26 6.14 94.17a54 54 0 0 0 30.54 30.54C156.74 353.72 224 354 224 354s67.26-.28 94.17-6.14a54 54 0 0 0 30.54-30.54c5.86-26.91 6.14-94.17 6.14-94.17s-.28-67.26-6.14-94.17ZM224 338a82 82 0 1 1 82-82 82 82 0 0 1-82 82Zm85.33-148a19.2 19.2 0 1 1 19.2-19.2 19.2 19.2 0 0 1-19.2 19.2Z"/></svg>
                  Instagram
                </button>
              </div>

              <div className="flex items-center gap-3 text-purple-300 text-xs">
                <div className="flex-1 h-px bg-purple-100" />
                <span>or fill in details</span>
                <div className="flex-1 h-px bg-purple-100" />
              </div>

              <form onSubmit={handleSignup} className="space-y-3">
                <input id="fullname"  type="text"  placeholder="Full name ✦"  value={formData.fullname}  onChange={handleInputChange} required className={inputCls} />
                <input id="username"  type="text"  placeholder="Username ✦"   value={formData.username}  onChange={handleInputChange} required className={inputCls} />
                <input id="email"     type="email" placeholder="Email ✦"       value={formData.email}     onChange={handleInputChange} required className={inputCls} />
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Password ••••••••" value={formData.password} onChange={handleInputChange} className={inputCls + " pr-10"} />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute inset-y-0 right-3 flex items-center text-purple-400 hover:text-purple-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button type="submit"
                  className="w-full py-3 rounded-2xl text-white font-bold text-base shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
                  style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}>
                  ♡ Create account →
                </button>
              </form>

              <p className="text-center text-sm text-purple-400">
                Already have an account?{" "}
                <a href="/login" className="text-purple-600 font-semibold hover:text-pink-500 transition-colors">Sign in ✦</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default SignupPage;
