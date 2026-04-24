import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, Bot } from 'lucide-react';

const demoAccounts = [
  { email: 'admin@hrms.com', password: 'admin123', role: 'Admin', color: 'bg-purple-100 text-purple-700' },
  { email: 'manager@hrms.com', password: 'manager123', role: 'Senior Manager', color: 'bg-blue-100 text-blue-700' },
  { email: 'hr@hrms.com', password: 'hr123', role: 'HR Recruiter', color: 'bg-emerald-100 text-emerald-700' },
  { email: 'john@hrms.com', password: 'emp123', role: 'Employee', color: 'bg-amber-100 text-amber-700' },
];

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI-HRMS</h1>
            <p className="text-indigo-300">Next-Gen HR Management</p>
          </div>
        </div>
        <h2 className="text-5xl font-bold text-white leading-tight mb-6">
          The Future of<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            HR Management
          </span>
        </h2>
        <p className="text-lg text-indigo-200 mb-8 max-w-lg">
          AI-powered resume screening, smart attendance tracking, automated payroll processing,
          and performance analytics — all in one platform.
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          {[
            { icon: Bot, label: 'AI Resume Screening' },
            { icon: Shield, label: 'Role-Based Access' },
            { icon: Mail, label: 'Smart Notifications' },
            { icon: Lock, label: 'Enterprise Security' },
          ].map((feature) => (
            <div key={feature.label} className="flex items-center gap-3 text-indigo-200">
              <feature.icon className="w-5 h-5 text-cyan-400" />
              <span className="text-sm">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
                <Shield className="w-8 h-8 text-indigo-600" />
                <span className="text-2xl font-bold text-gray-900">AI-HRMS</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-1">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6">
              <p className="text-center text-xs text-gray-500 mb-3">Quick demo access</p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleDemoLogin(acc.email, acc.password)}
                    className={`text-xs font-medium px-3 py-2 rounded-lg ${acc.color} hover:opacity-80 transition-opacity`}
                  >
                    {acc.role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
