import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ValentineConfig, DayType, DEFAULT_CONTENT } from '../types';
import { getUserConfig, updateUserConfig } from '../services/storage';
import { getSessionUser, updateSessionActivity, clearSession } from '../utils/sessionManager';
import ConfessionRenderer from '../components/ConfessionRenderer';

const SHARE_MESSAGES: Record<DayType, { title: string, text: string }> = {
  [DayType.ROSE]: {
    title: "🌹 A Rose for You...",
    text: "Ek surprise rose bhej raha hu... Sirf tumhare liye! 🌹 Isse dekhna zaroor. ❤️"
  },
  [DayType.PROPOSE]: {
    title: "💍 Ek Baat Kehni Thi...",
    text: "Dil ki baat zubaan pe aayi hai... Will you be mine forever? 🥺 Open this."
  },
  [DayType.CHOCOLATE]: {
    title: "🍫 Kuch Meetha Ho Jaye?",
    text: "Life is sweeter with you... maine tumhare liye kuch bheja hai! 🍫 Check karlo."
  },
  [DayType.TEDDY]: {
    title: "🧸 A Cute Surprise!",
    text: "Ye Teddy tumse kuch kehna chahta hai... sunogi nahi? 🧸 Sending a bear hug!"
  },
  [DayType.PROMISE]: {
    title: "🤝 Ek Vaada...",
    text: "Aaj tumse ek promise karna hai... Jo kabhi nahi tutega. 🤞 Read my promise."
  },
  [DayType.HUG]: {
    title: "🤗 Need a Hug?",
    text: "Bahut mann kar raha hai tumhe gale lagane ka... 🤗 Sending a magic hug!"
  },
  [DayType.KISS]: {
    title: "💋 A Secret Gift...",
    text: "Ek surprise kiss bheja hai... sirf tumhare liye! 😘 Catch it now."
  },
  [DayType.VALENTINE]: {
    title: "❤️ My Forever Valentine",
    text: "Sab kuch keh diya aaj... bas tumhara haan chahiye. 🌹 Will you be my Valentine?"
  },
  [DayType.WAITING]: { title: "Valentine Week", text: "Something special is coming..." },
  [DayType.FINISHED]: { title: "Valentine Week", text: "Thank you for the memories!" }
};

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

  // State for Custom Share Modal
  const [shareModalData, setShareModalData] = useState<{ day: string, link: string, title: string, text: string } | null>(null);

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

  const toggleActivation = async () => {
    if (!user || !config) return;
    const newState = !config.isActive;
    const newConfig = { ...config, isActive: newState };

    // Optimistic update
    setConfig(newConfig);

    // Save to DB
    await import('../services/storage').then(m => m.updateConfigStatus(user.id, newState));

    // Also set local preference to match
    localStorage.setItem('val_data_' + user.id, JSON.stringify(newConfig));
    if (newState) {
      localStorage.setItem('user_mode_preference', 'live');
    } else {
      localStorage.setItem('user_mode_preference', 'demo');
    }
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
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {config.isActive ? 'Website is LIVE 🟢' : 'Preview Mode 🛠️'}
            </h3>

            {config.isActive ? (
              <p className="text-sm text-gray-600 mt-1 leading-relaxed max-w-lg">
                <strong>Badhai ho! Aapki website ab LIVE hai! 🎉</strong><br />
                Timers original dates (Feb 7 - 14) ke hisaab se locked rahenge.
                Ab aap bina tension link apne partner ko share kar sakte hain! ❤️
              </p>
            ) : (
              <p className="text-sm text-gray-600 mt-1 leading-relaxed max-w-lg">
                <strong>Abhi Testing chal rahi hai. 🚧</strong><br />
                Is mode me timers sirf <span className="text-red-500 font-bold">10 seconds</span> ke hain taaki aap saare days check kar sakein.
                Partner ko link bhejne se pehle <strong>"Go Live"</strong> zaroor dabayein!
              </p>
            )}
          </div>
          <button
            onClick={toggleActivation}
            className={`px-6 py-2 rounded-full font-bold shadow-md transform transition hover:scale-105 ${config.isActive ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-600 text-white'}`}
          >
            {config.isActive ? 'Deactivate (Wapas Testing Pe)' : 'Go Live Now 🚀'}
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
              <div key={day} className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                {/* Icon & Details */}
                <div className="flex items-center gap-3 w-full">
                  <span className="text-3xl bg-rose-50 p-2 rounded-lg shrink-0">{DAY_ICONS[day]}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-800 capitalize text-lg leading-tight">{day} Day</h4>
                    <p className="text-xs text-gray-500 truncate">
                      {config.days[day]?.message?.substring(0, 40) || 'No message set...'}...
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-rose-50">
                  <button
                    onClick={() => {
                      if (!user) return;
                      const link = `${window.location.origin}/#/v/${user.id}?day=${day}`;
                      window.open(link, '_blank');
                    }}
                    className="flex text-blue-600 px-2 py-2 rounded-lg hover:bg-blue-50 font-bold text-xs items-center justify-center gap-1 transition-all active:scale-95 border border-blue-100"
                    title="Open in New Tab"
                  >
                    Open ↗️
                  </button>

                  <button
                    onClick={async () => {
                      if (!user) return;
                      const link = `${window.location.origin}/#/v/${user.id}?day=${day}`;
                      const content = SHARE_MESSAGES[day] || { title: `Happy ${day} Day!`, text: `Check this out! ${link}` };

                      const shareData = {
                        title: content.title,
                        text: `${content.text}\n\n${link}`,
                        url: link
                      };

                      // Try Native Share First
                      if (navigator.share) {
                        try {
                          await navigator.share(shareData);
                          return; // Success, exit
                        } catch (err) {
                          console.log('Share closed/failed, showing fallback', err);
                        }
                      }

                      // Fallback to Manual Modal (for HTTP/PC compatibility)
                      setShareModalData({ day, link, title: content.title, text: content.text });
                    }}
                    className="flex text-indigo-600 px-2 py-2 rounded-lg hover:bg-indigo-50 font-bold text-xs items-center justify-center gap-1 transition-all active:scale-95 border border-indigo-100"
                    title="Share Link"
                  >
                    Share 📤
                  </button>

                  <button
                    onClick={() => startEditing(day)}
                    className="flex text-rose-600 px-2 py-2 rounded-lg hover:bg-rose-50 font-bold text-xs items-center justify-center gap-1 transition-all active:scale-95 border border-rose-100"
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

          {/* EDITING PANEL */}
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

      {/* CUSTOM SHARE MODAL (Fallback for PC/HTTP) */}
      {shareModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative animate-zoom-in">
            <button
              onClick={() => setShareModalData(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">{DAY_ICONS[shareModalData.day as DayType]}</span>
              <h3 className="text-xl font-bold text-gray-800">Share {shareModalData.day} Link</h3>

              {/* HTTPS Explainer for User Peace of Mind */}
              <div className="bg-yellow-50 text-yellow-700 text-[10px] p-2 rounded-lg mt-2 mx-auto leading-tight border border-yellow-100">
                ⚠️ Native Share (Insta/Messenger) is disabled by browsers on local WiFi.
                <br /><strong>It will work automatically on your Live Website! 🚀</strong>
              </div>
            </div>

            <div className="space-y-3">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareModalData.text}\n\n${shareModalData.link}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-3 rounded-xl font-bold hover:bg-[#20bd5a] transition-colors shadow-sm"
                onClick={() => setShareModalData(null)}
              >
                <span>💬</span> WhatsApp
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareModalData.link)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#1877F2] text-white py-3 rounded-xl font-bold hover:bg-[#166fe5] transition-colors shadow-sm"
                onClick={() => setShareModalData(null)}
              >
                <span>f</span> Facebook
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareModalData.link)}&text=${encodeURIComponent(shareModalData.text)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#0088cc] text-white py-3 rounded-xl font-bold hover:bg-[#0077b5] transition-colors shadow-sm"
                onClick={() => setShareModalData(null)}
              >
                <span>✈️</span> Telegram
              </a>

              {/* Copy Link Section */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-bold uppercase text-center">Copy for Instagram / Messenger / Twitter</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareModalData.link}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-200"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button
                    onClick={() => {
                      try {
                        const input = document.querySelector('input[readonly]') as HTMLInputElement;
                        if (input) input.select();

                        // Try modern API
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(shareModalData.link)
                            .then(() => alert("Link Copied! Paste it anywhere. ✨"))
                            .catch(() => { document.execCommand('copy'); alert("Copied!"); });
                        } else {
                          document.execCommand('copy');
                          alert("Copied!");
                        }
                      } catch (e) {
                        prompt("Manually copy this link:", shareModalData.link);
                      }
                    }}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-900 shadow-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
