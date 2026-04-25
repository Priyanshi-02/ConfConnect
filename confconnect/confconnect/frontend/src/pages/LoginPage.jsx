import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  'Ministry of Education', 'Ministry of Home Affairs', 'Ministry of Finance',
  'Ministry of Health & Family Welfare', 'Ministry of Defence',
  'Ministry of External Affairs', 'Ministry of Agriculture',
  'Ministry of Commerce & Industry', 'Ministry of Electronics & IT',
  'Ministry of Housing & Urban Affairs',
];

export default function LoginPage() {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (tab === 'login') {
      const res = await login(form.email, form.password);
      if (res.success) { toast.success('Welcome back!'); navigate('/'); }
      else toast.error(res.message);
    } else {
      if (!form.name || !form.email || !form.password) { toast.error('All fields are required'); return; }
      const res = await register(form.name, form.email, form.password, form.department);
      if (res.success) { toast.success('Account created!'); navigate('/'); }
      else toast.error(res.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-[#0f2156] flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm text-center">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6">🏛️</div>
          <h1 className="text-4xl font-extrabold mb-3">ConfConnect</h1>
          <p className="text-white/60 text-lg leading-relaxed">Conference Room Booking System<br />Government of India — Centralized Portal</p>
          <div className="mt-10 bg-white/5 rounded-2xl p-6 text-left space-y-4">
            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3">Quick Demo Access</p>
            <div className="bg-white/5 rounded-lg p-3 text-sm">
              <p className="text-orange-300 font-semibold">🔑 Admin Account</p>
              <p className="text-white/60 text-xs mt-1">b221370@skit.ac.in / admin123</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-sm">
              <p className="text-blue-300 font-semibold">👤 User Account</p>
              <p className="text-white/60 text-xs mt-1">Any email / any password</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[['500+','Rooms'],['14','Ministries'],['Real-time','Availability']].map(([v,l]) => (
              <div key={l}><p className="text-2xl font-bold text-orange-400">{v}</p><p className="text-xs text-white/40">{l}</p></div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white lg:max-w-md lg:shadow-2xl">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-[#0f2156]">Welcome Back</h2>
            <p className="text-gray-400 text-sm mt-1">Sign in to the booking portal</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b-2 border-gray-200 mb-6">
            {['login', 'signup'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-0.5 ${tab === t ? 'border-[#0f2156] text-[#0f2156]' : 'border-transparent text-gray-400'}`}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
            )}
            <div>
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            {tab === 'signup' && (
              <div>
                <label className="form-label">Department</label>
                <select className="form-input" value={form.department} onChange={e => set('department', e.target.value)}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}

            <button className="btn-primary w-full py-3 text-base justify-center" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>

            <div className="flex items-center gap-3 text-gray-300 text-sm my-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span>or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button className="w-full border border-gray-200 rounded-lg py-2.5 flex items-center justify-center gap-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
