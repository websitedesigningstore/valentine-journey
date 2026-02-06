import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../services/storage';
import { setSession } from '../utils/sessionManager';
import FloatingHearts from '../components/FloatingHearts';

const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!mobile || mobile.length !== 10) {
        throw new Error("Please enter a valid 10-digit mobile number");
      }
      if (!pin || pin.length < 4) {
        throw new Error("PIN must be 4 digits");
      }

      if (isLogin) {
        const user = await loginUser(mobile, pin);
        setSession(user);
        navigate('/dashboard');
      } else {
        if (!username.trim() || !partnerName.trim()) {
          throw new Error("Please enter both your name and partner's name");
        }
        const user = await registerUser(username, mobile, partnerName, pin);
        setSession(user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Something went wrong');
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-rose-100 via-pink-100 to-rose-200">
      <FloatingHearts />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent mb-2">
            💖 Valentine Journey
          </h1>
          <p className="text-gray-600 text-sm">
            {isLogin ? 'Welcome back to your love story' : 'Create your unique Valentine experience'}
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${isLogin
              ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
              : 'bg-white/50 text-gray-600 hover:bg-white/70'
              }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${!isLogin
              ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
              : 'bg-white/50 text-gray-600 hover:bg-white/70'
              }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Mobile Number</label>
            <input
              type="tel"
              required
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 rounded-xl bg-white/70 border-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all shadow-inner text-gray-800 placeholder-gray-400 font-mono tracking-wider"
              placeholder="9876543210"
            />
          </div>

          {!isLogin && (
            <>
              <div className="animate-fade-in-up">
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/70 border-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all shadow-inner text-gray-800 placeholder-gray-400"
                  placeholder="e.g. Rahul"
                />
              </div>

              <div className="animate-fade-in-up">
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Partner's Name</label>
                <input
                  type="text"
                  required
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/70 border-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all shadow-inner text-gray-800 placeholder-gray-400"
                  placeholder="e.g. Anjali"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Secret PIN</label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                required
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/70 border-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all shadow-inner text-gray-800 placeholder-gray-400"
                placeholder="••••"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-rose-600 transition-colors p-1"
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Connecting Hearts...' : (isLogin ? 'Enter Your World 💖' : 'Start Love Journey 🚀')}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* HELP BUTTON */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => window.open('https://wa.me/918294037318?text=Hello%20Admin,%20I%20need%20help%20with%20Valentine%20Journey', '_blank')}
            className="inline-flex items-center gap-2 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-full transition-all border border-green-200 shadow-sm"
          >
            Need Help? Chat on WhatsApp 💬
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 text-center text-white/80 text-xs font-light">
        Made with Love | &copy; 2026
      </div>
    </div>
  );
};

export default LandingPage;
