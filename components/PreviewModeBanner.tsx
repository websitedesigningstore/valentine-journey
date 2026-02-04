import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface PreviewModeBannerProps {
    onModeChange?: () => void;
}

const PreviewModeBanner: React.FC<PreviewModeBannerProps> = ({ onModeChange }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleGoLive = () => {
        // Remove demo parameter from URL
        const params = new URLSearchParams(location.search);
        params.delete('demo');
        params.set('mode', 'live');

        // Update localStorage
        localStorage.setItem('user_mode_preference', 'live');

        // For HashRouter, we construct the path carefully
        // location.pathname is the path inside the hash (e.g. /v/userId)
        // location.search is the query string inside the hash
        const newSearch = params.toString();
        const newHashPath = `${location.pathname}?${newSearch}`;

        // Navigate
        navigate(newHashPath, { replace: true });
        window.location.reload();
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-3 shadow-lg">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🔧</span>
                    <div>
                        <h3 className="font-bold text-lg">Preview Mode</h3>
                        <p className="text-sm opacity-90">Timers are short (10s) for testing.</p>
                    </div>
                </div>
                <button
                    onClick={handleGoLive}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all shadow-md flex items-center gap-2"
                >
                    Go Live Now 🚀
                </button>
            </div>
        </div>
    );
};

export default PreviewModeBanner;
