import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ChevronDown, Plane, Globe, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const ROLES = ['Staff', 'Manager', 'Super Admin'];

export default function Login() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [role, setRole] = useState('Administrator');
 const [roleOpen, setRoleOpen] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const [error, setError] = useState('');
 const [isLoading, setIsLoading] = useState(false);

 const navigate = useNavigate();
 const { login, user } = useAuth();

 if (user) return <Navigate to="/" replace />;

 const handleLogin = async (e) => {
 e.preventDefault();
 setIsLoading(true);
 setError('');

 try {
 const res = await fetch(`${API_BASE_URL}/auth/login`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email, password }),
 });

 const data = await res.json();
 if (!res.ok) throw new Error(data.message || 'Login failed');

 login(data.token, data.user);
 navigate('/');
 } catch (err) {
 setError(err.message);
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', 'Segoe UI', sans-serif", background: 'white' }}>

 {/* ── RIGHT PANEL ── form */}
 <div style={{
 flex: 1,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '2rem',
 }}>
 <div style={{ width: '100%', maxWidth: '420px' }}>

 {/* Heading */}
 <div style={{ marginBottom: '40px' }}>
 <h2 style={{
 fontSize: '2rem', fontWeight: 800, color: '#2563eb',
 letterSpacing: '-0.5px', marginBottom: '8px',
 }}>
 Welcome Back
 </h2>
 <p style={{ color: '#8a9bb0', fontSize: '14px' }}>
 Sign in to your admin dashboard
 </p>
 </div>

 {/* Error */}
 {error && (
 <div style={{
 marginBottom: '20px',
 padding: '12px 16px',
 borderRadius: '12px',
 background: '#fef2f2',
 border: '1px solid #fecaca',
 color: '#dc2626',
 fontSize: '14px',
 display: 'flex',
 alignItems: 'center',
 gap: '8px',
 }}>
 <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
 </svg>
 {error}
 </div>
 )}

 <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

 {/* Role selector */}
 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
 Select Your Role
 </label>
 <div style={{ position: 'relative' }}>
 <button
 type="button"
 id="role-selector"
 onClick={() => setRoleOpen(!roleOpen)}
 style={{
 width: '100%', display: 'flex', alignItems: 'center',
 padding: '14px 16px', background: 'white',
 border: roleOpen ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
 borderRadius: '14px', cursor: 'pointer',
 fontSize: '15px', color: '#1f2937', fontWeight: 500,
 transition: 'border-color 0.2s',
 boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
 }}
 >
 <User size={18} color="#8a9bb0" style={{ marginRight: '12px', flexShrink: 0 }} />
 <span style={{ flex: 1, textAlign: 'left' }}>{role}</span>
 <ChevronDown
 size={18}
 color="#8a9bb0"
 style={{ transform: roleOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
 />
 </button>

 {roleOpen && (
 <div style={{
 position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
 background: 'white', borderRadius: '14px', zIndex: 50,
 border: '1.5px solid #e2e8f0',
 boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
 overflow: 'hidden',
 }}>
 {ROLES.map((r) => (
 <button
 key={r}
 type="button"
 onClick={() => { setRole(r); setRoleOpen(false); }}
 style={{
 width: '100%', textAlign: 'left', padding: '12px 16px',
 background: r === role ? '#eff6ff' : 'transparent',
 color: r === role ? '#2563eb' : '#374151',
 fontWeight: r === role ? 600 : 400,
 fontSize: '14px', cursor: 'pointer', border: 'none',
 transition: 'background 0.15s',
 }}
 onMouseEnter={e => { if (r !== role) e.currentTarget.style.background = '#f8fafc'; }}
 onMouseLeave={e => { if (r !== role) e.currentTarget.style.background = 'transparent'; }}
 >
 {r}
 </button>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Email */}
 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
 Email Address
 </label>
 <div style={{ position: 'relative' }}>
 <Mail size={18} color="#8a9bb0" style={{
 position: 'absolute', left: '16px', top: '50%',
 transform: 'translateY(-50%)', pointerEvents: 'none',
 }} />
 <input
 type="email"
 required
 value={email}
 onChange={e => setEmail(e.target.value)}
 placeholder="name@company.com"
 autoComplete="email"
 style={{
 width: '100%', padding: '14px 16px 14px 46px',
 border: '1.5px solid #e2e8f0', borderRadius: '14px',
 fontSize: '15px', color: '#1f2937', background: 'white',
 outline: 'none', boxSizing: 'border-box',
 boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
 transition: 'border-color 0.2s',
 fontFamily: 'inherit',
 }}
 onFocus={e => e.target.style.borderColor = '#2563eb'}
 onBlur={e => e.target.style.borderColor = '#e2e8f0'}
 />
 </div>
 </div>

 {/* Password */}
 <div>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
 <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
 Password
 </label>
 <a href="#" style={{ fontSize: '13px', color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}
 onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
 onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
 Forgot Password?
 </a>
 </div>
 <div style={{ position: 'relative' }}>
 <Lock size={18} color="#8a9bb0" style={{
 position: 'absolute', left: '16px', top: '50%',
 transform: 'translateY(-50%)', pointerEvents: 'none',
 }} />
 <input
 type={showPassword ? 'text' : 'password'}
 required
 value={password}
 onChange={e => setPassword(e.target.value)}
 placeholder="••••••••"
 autoComplete="current-password"
 style={{
 width: '100%', padding: '14px 48px 14px 46px',
 border: '1.5px solid #e2e8f0', borderRadius: '14px',
 fontSize: '15px', color: '#1f2937', background: 'white',
 outline: 'none', boxSizing: 'border-box',
 boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
 transition: 'border-color 0.2s',
 fontFamily: 'inherit',
 }}
 onFocus={e => e.target.style.borderColor = '#2563eb'}
 onBlur={e => e.target.style.borderColor = '#e2e8f0'}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 style={{
 position: 'absolute', right: '14px', top: '50%',
 transform: 'translateY(-50%)', background: 'none',
 border: 'none', cursor: 'pointer', padding: '4px',
 color: '#8a9bb0', display: 'flex', alignItems: 'center',
 }}
 >
 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>
 </div>

 {/* Submit */}
 <button
 type="submit"
 disabled={isLoading}
 style={{
 width: '100%', padding: '15px',
 background: isLoading ? '#93c5fd' : '#2563eb',
 color: 'white', border: 'none', borderRadius: '14px',
 fontSize: '15px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
 boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
 transition: 'opacity 0.2s, transform 0.1s',
 fontFamily: 'inherit',
 marginTop: '4px',
 }}
 onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.92'; }}
 onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
 onMouseDown={e => { if (!isLoading) e.currentTarget.style.transform = 'scale(0.99)'; }}
 onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
 >
 {isLoading ? (
 <div style={{
 width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)',
 borderTop: '2px solid white', borderRadius: '50%',
 animation: 'spin 0.7s linear infinite',
 }} />
 ) : 'Sign In'}
 </button>
 </form>

 {/* Footer hint */}
 <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#aab4bf' }}>
 Default admin: <strong style={{ color: '#6b8fa8' }}>admin@elitetravel.com</strong> / <strong style={{ color: '#6b8fa8' }}>admin123</strong>
 </p>
 </div>
 </div>

 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
 @keyframes spin { to { transform: rotate(360deg); } }
 `}</style>
 </div>
 );
}
