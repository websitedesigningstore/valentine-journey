import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ValentineConfig, DayType, DEFAULT_CONTENT } from '../types';
import { getUserConfig, updateUserConfig } from '../services/storage';
import { getSessionUser, updateSessionActivity, clearSession } from '../utils/sessionManager';
import ConfessionRenderer from '../components/ConfessionRenderer';

const DAY_ICONS: Record<DayType, string> = {
  [DayType.ROSE]: '🌹',
  [DayType.PROPOSE]: '💍',
  [DayType.CHOCOLATE]: '🍫',
  [DayType.TEDDY]: '🧸',
  [DayType.PROMISE]: '🤝',
  [DayType.HUG]: '🤗',
  [DayType.KISS]: '💋',
  [DayType.VALENTINE]: '❤️',
  [DayType.WAITING]: '⏳',
  [DayType.FINISHED]: '🏁'
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<ValentineConfig | null>(null);
  const [editingDay, setEditingDay] = useState<DayType | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check session validity
    const u = getSessionUser();
    if (!u) {
      navigate('/');
      return;
    }
    setUser(u);
    loadConfig(u.id);

    // Update activity on any interaction
    const handleActivity = () => updateSessionActivity();
    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [navigate]);

  const loadConfig = async (id: string) => {
    const c = await getUserConfig(id);
    if (c) setConfig(c);
  };

  const startEditing = (day: DayType) => {
    if (!config) return;
    setEditingDay(day);
    setMessage(config.days[day]?.message || DEFAULT_CONTENT[day].message);
  };

  const handleSave = async () => {
    if (!user || !config || !editingDay) return;
    const newContent = { message };
    await updateUserConfig(user.id, editingDay, newContent);
    const updated = { ...config };
    updated.days[editingDay] = { ...updated.days[editingDay], message };
    setConfig(updated);
    setEditingDay(null);
    alert('Message saved! ❤️');
  };

  const copyDayLink = (day: DayType) => {
    if (!user) return;
    const link = `${window.location.origin}/#/v/${user.id}?day=${day}`;
    navigator.clipboard.writeText(link);
    alert(`Link for ${day.toUpperCase()} copied!`);
  };

  const toggleActivation = () => {
    if (!user || !config) return;
    const newState = !config.isActive;
    const newConfig = { ...config, isActive: newState };
    localStorage.setItem('val_data_' + user.id, JSON.stringify(newConfig));
    setConfig(newConfig);
  };

  if (!user || !config) return <div className="p-10 text-center text-rose-500 animate-pulse">Loading Dashboard...</div>;

  const daysList = [DayType.ROSE, DayType.PROPOSE, DayType.CHOCOLATE, DayType.TEDDY, DayType.PROMISE, DayType.HUG, DayType.KISS, DayType.VALENTINE];

  // Group Confessions
  const groupedConfessions = config.confessions.reduce((acc, curr) => {
    if (!acc[curr.day]) acc[curr.day] = [];
    acc[curr.day].push(curr);
    return acc;
  }, {} as Record<string, typeof config.confessions>);

  return (
    <div className="min-h-screen pb-20 p-4 max-w-4xl mx-auto bg-gray-50/50">
      <header className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-hand font-bold text-rose-600">Hi, {user.username} 👋</h1>
          <p className="text-sm text-gray-500">Creating magic for {user.partnerName}</p>
        </div>
        <button onClick={() => { clearSession(); navigate('/'); }} className="text-sm border border-rose-200 px-3 py-1 rounded-full text-rose-500 hover:bg-rose-50">Logout</button>
      </header>

      {/* Activation Status */}
      <div className={`glass-card p-6 rounded-2xl mb-10 border-l-8 shadow-sm ${config.isActive ? 'border-l-green-400 bg-white' : 'border-l-yellow-400 bg-white'}`}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{config.isActive ? 'Website is LIVE 🟢' : 'Preview Mode 🛠️'}</h3>
            <p className="text-sm text-gray-500">{config.isActive ? 'Timers match real dates.' : 'Timers are short (10s) for testing.'}</p>
          </div>
          <button
            onClick={toggleActivation}
            className={`px-6 py-2 rounded-full font-bold shadow-md transform transition hover:scale-105 ${config.isActive ? 'bg-red-50 text-red-600' : 'bg-green-600 text-white'}`}
          >
            {config.isActive ? 'Deactivate (Test Mode)' : 'Go Live Now 🚀'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">

        {/* LEFT COLUMN: DAY MANAGEMENT */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span>📅 Manage Days</span>
            <span className="ml-auto text-xs font-normal text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">All Links Unique</span>
          </h2>

          <div className="space-y-4">
            {daysList.map(day => (
              <div key={day} className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <span className="text-3xl bg-rose-50 p-2 rounded-lg">{DAY_ICONS[day]}</span>
                  <div>
                    <h4 className="font-bold text-gray-800 capitalize">{day} Day</h4>
                    <p className="text-xs text-gray-400">
                      {config.days[day]?.message?.substring(0, 20)}...
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => copyDayLink(day)}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 font-medium flex items-center justify-center gap-1"
                  >
                    🔗 Link
                  </button>
                  <button
                    onClick={() => startEditing(day)}
                    className="text-xs bg-rose-100 text-rose-600 px-3 py-1.5 rounded-full hover:bg-rose-200 font-medium"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: CONFESSIONS & EDITING */}
        <div className="space-y-8">

          {/* EDITING PANEL (Sticky if possible, or just placed here) */}
          {editingDay && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-rose-200 animate-slide-up sticky top-4 z-20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-rose-700 flex items-center gap-2">
                  {DAY_ICONS[editingDay]} Editing {editingDay}
                </h3>
                <button onClick={() => setEditingDay(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-40 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-rose-400 outline-none resize-none mb-4 text-gray-700"
              />

              <div className="flex gap-2">
                <button onClick={() => setEditingDay(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                <button onClick={handleSave} className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-rose-600">Save Message</button>
              </div>
            </div>
          )}

          {/* CONFESSIONS */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6 sticky top-0 bg-gray-50/50 backdrop-blur-sm py-2 z-10">💌 Confessions Box</h2>

            {config.confessions.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="text-4xl mb-2 opacity-50">📫</div>
                <p className="text-gray-500">No confessions received yet.</p>
                <p className="text-xs text-gray-400 mt-1">Share the links to start receiving love!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedConfessions).map(([day, list]) => (
                  <div key={day} className="animate-fade-in">
                    <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                      {DAY_ICONS[day as DayType]} {day}
                      <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[10px]">{list.length}</span>
                    </h3>
                    <div className="space-y-3">
                      {list.map((c, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                          <ConfessionRenderer day={c.day} text={c.text} />
                          <div className="mt-3 flex justify-between items-center border-t border-gray-50 pt-2">
                            <span className="text-[10px] text-gray-400">{new Date(c.date).toLocaleString()}</span>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{day}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
