import { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { Eye, EyeOff, CheckCircle, MapPin, Zap, Loader2 } from 'lucide-react';
import { API_URL, ERROR_MESSAGES, ROLES } from './config';
import { AuthContext } from './AuthContext';
import Toast from './components/Toast';
import ForgotPasswordModal from './components/ForgotPasswordModal';

// Custom animations
const styles = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes bounce-in {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  .animate-fade-in { animation: fade-in 1s ease-out; }
  .animate-slide-up { animation: slide-up 0.8s ease-out; }
  .animate-bounce-in { animation: bounce-in 0.8s ease-out; }
  .animate-shake { animation: shake 0.5s ease-in-out; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  .delay-400 { animation-delay: 0.4s; }
  .delay-500 { animation-delay: 0.5s; }
  .delay-600 { animation-delay: 0.6s; }
  .delay-700 { animation-delay: 0.7s; }
  .delay-1000 { animation-delay: 1s; }
`;

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [toast, setToast] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { login } = useContext(AuthContext);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setToast(null);

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', data.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    try {
      const response = await axios.post(`${API_URL}/login_admin.php`, data, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      const result = response.data;

      if (result.status === 'success') {
        if (![ROLES.ADMIN, ROLES.BFP, ROLES.INSPECTOR].includes(result.user.role)) {
          setToast({ message: ERROR_MESSAGES.ACCESS_DENIED, type: 'error' });
          return;
        }
        login(result.user, result.token);
      } else {
        setToast({ message: result.message || ERROR_MESSAGES.INVALID_CREDENTIALS, type: 'error' });
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.code === 'ERR_NETWORK'
        ? 'Cannot connect to server. Please check your network connection.'
        : ERROR_MESSAGES.NETWORK_ERROR;
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="h-screen flex bg-gradient-to-br from-orange-50 via-white to-red-50 font-inter relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff6b35' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-orange-600 to-red-500 p-12 flex-col justify-center items-center relative overflow-hidden text-white animate-fade-in">
        <div className="absolute inset-0 opacity-20 blur-3xl">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-white/15 rounded-full animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center max-w-lg">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <Zap size={32} className="text-orange-200" />
            </div>
          </div>
          <h2 className="text-6xl font-bold mb-4 tracking-tight font-josefin-sans animate-slide-up">
            BFP Admin Portal
          </h2>
          <p className="text-orange-100 mb-8 font-light leading-relaxed text-xl animate-slide-up delay-200">
            Manage hazard reports, licensing, and real-time analytics — built for fast, reliable emergency response.
          </p>
          <div className="space-y-4 text-base animate-slide-up delay-400">
            <div className="flex items-center justify-center gap-3 text-orange-50 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <CheckCircle size={20} />
              <span>Real-time hazard monitoring</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-orange-50 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <MapPin size={20} />
              <span>GPS-enabled response tracking</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-orange-50 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <Zap size={20} />
              <span>Advanced analytics & reporting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-sm bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-orange-200/50 p-6 animate-fade-in delay-300 hover:shadow-3xl transition-shadow duration-300">
          {/* Logos */}
          <div className="flex items-center justify-center gap-4 mb-6 animate-bounce-in delay-500">
            <div className="p-2 bg-orange-50 rounded-xl shadow-sm">
              <img src="/tagudin-logo.png" alt="Tagudin" className="w-10 h-10 object-contain" />
            </div>
            <div className="p-2 bg-orange-50 rounded-xl shadow-sm">
              <img src="/hazartrack-logo.png" alt="HazardTrack" className="w-10 h-10 object-contain" />
            </div>
            <div className="p-2 bg-orange-50 rounded-xl shadow-sm">
              <img src="/bfp-logo.png" alt="BFP" className="w-10 h-10 object-contain" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-gray-800 mb-2 font-josefin-sans animate-slide-up delay-600">
              Welcome Back
            </h2>
            <p className="text-base text-gray-600 leading-relaxed animate-slide-up delay-700">
              Sign in to your admin dashboard
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div className="relative group">
              <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-orange-600">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all text-base bg-gray-50/50 backdrop-blur-sm"
                  placeholder="admin@bfp.gov.ph"
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              {errors.email && <p id="email-error" className="text-red-600 text-xs mt-2 animate-shake">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="relative group">
              <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-orange-600">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full px-4 py-3 pl-12 pr-12 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all text-base bg-gray-50/50 backdrop-blur-sm"
                  placeholder="••••••••"
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth={2} />
                    <circle cx="12" cy="16" r="1" strokeWidth={2} />
                    <path d="m9 11 3-3 3 3" strokeWidth={2} />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="text-red-600 text-xs mt-2 animate-shake">{errors.password.message}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-2 border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2"
                />
                <span className="font-medium">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors underline decoration-2 underline-offset-2 hover:decoration-orange-700"
              >
                Forgot password?
              </button>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
              aria-describedby={loading ? "loading-status" : undefined}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500 leading-relaxed">
              &copy; {new Date().getFullYear()} Bureau of Fire Protection - Tagudin
              <br />
              <span className="text-orange-600 font-medium">Securing Communities, One Response at a Time</span>
            </p>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </div>
    </>
  );
}
