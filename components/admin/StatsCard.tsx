import React from 'react';

interface StatsCardProps {
    icon: string;
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'purple' | 'blue' | 'green' | 'red' | 'orange';
}

const StatsCard: React.FC<StatsCardProps> = ({
    icon,
    title,
    value,
    change,
    trend = 'neutral',
    color = 'purple'
}) => {
    const colorClasses = {
        purple: 'from-purple-500 to-pink-500',
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        red: 'from-red-500 to-orange-500',
        orange: 'from-orange-500 to-yellow-500'
    };

    const trendIcons = {
        up: '📈',
        down: '📉',
        neutral: '➡️'
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={`text-4xl p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-20`}>
                    {icon}
                </div>
                {change && (
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-900/30 text-green-400' :
                            trend === 'down' ? 'bg-red-900/30 text-red-400' :
                                'bg-gray-700 text-gray-400'
                        }`}>
                        {trendIcons[trend]} {change}
                    </div>
                )}
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-white text-3xl font-bold">{value}</p>
        </div>
    );
};

export default StatsCard;
