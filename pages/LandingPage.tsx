import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../services/storage';
import { setSession } from '../utils/sessionManager';
import FloatingHearts from '../components/FloatingHearts';

const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = await loginUser(username, pin);
        setSession(user); // Set session with timestamp
        navigate('/dashboard');
      } else {
        const user = await registerUser(username, partnerName, pin);
        setSession(user); // Set session with timestamp
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-100 via-pink-200 to-rose-300 overflow-hidden">
      <FloatingHearts />

      <div className="relative z-10 w-full max-w-md glass-card p-8 rounded-3xl shadow-2xl border border-white/60 backdrop-blur-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-hand font-bold text-rose-600 drop-shadow-sm mb-2">Valentine's Week</h1>
          <p className="text-gray-700 italic font-medium">"Create a magical journey for your love." ❤️</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        <div className="flex bg-white/40 p-1 rounded-xl mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${isLogin ? 'bg-rose-500 text-white shadow-md' : 'text-gray-600 hover:bg-white/50'
              }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${!isLogin ? 'bg-rose-500 text-white shadow-md' : 'text-gray-600 hover:bg-white/50'
              }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Your Name ID</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/70 border-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all shadow-inner text-gray-800 placeholder-gray-400"
              placeholder="e.g. rahul_lover"
            />
          </div>

          {!isLogin && (
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
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Secret PIN</label>
            <input
              type="password"
              required
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/70 border-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all shadow-inner text-gray-800 placeholder-gray-400"
              placeholder="••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Connecting Hearts...' : (isLogin ? 'Enter Your World 💖' : 'Start Love Journey 🚀')}
          </button>
        </form>
      </div>

      <div className="absolute bottom-4 text-center text-white/80 text-xs font-light">
        Made with Love | &copy; 2026
      </div>
    </div>
  );
};

export default LandingPage;
