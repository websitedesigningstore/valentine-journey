import React from 'react';
import { DayType } from '../types';

interface ConfessionRendererProps {
    day: string;
    text: string;
}

const ConfessionRenderer: React.FC<ConfessionRendererProps> = ({ day, text }) => {
    // 1. ROSE DAY
    if (day === DayType.ROSE && text.includes("Rose Day Completed!")) {
        return (
            <div className="space-y-2 text-sm border-l-4 border-rose-300 pl-4 bg-rose-50/50 p-3 rounded-r-lg">
                <div className="font-bold text-rose-600 border-b border-rose-100 pb-1 mb-2 flex items-center gap-2">
                    <span>🌹</span> Rose Day Activity Log
                </div>
                {text.replace("Rose Day Completed! Log: ", "").split(", ").map((logItem, i) => {
                    if (logItem.includes("Q")) {
                        const parts = logItem.split(":");
                        return (
                            <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-rose-100 shadow-sm">
                                <span className="font-bold text-rose-700 bg-rose-100 px-2 rounded-md text-xs py-0.5">{parts[0]}</span>
                                <span className="text-gray-800">{parts.slice(1).join(":")}</span>
                            </div>
                        )
                    }
                    if (logItem.includes("NO")) {
                        return <div key={i} className="text-red-500 text-xs pl-2 font-medium">• {logItem}</div>
                    }
                    return <div key={i} className="text-gray-600 pl-2 text-xs">• {logItem}</div>
                })}
            </div>
        );
    }

    // 2. PROPOSE DAY
    if (day === DayType.PROPOSE) {
        const hasLog = text.includes("Activity Log");
        const hasYes = text.includes("SHE SAID YES");

        return (
            <div className="space-y-4">
                {hasLog && (
                    <div className="space-y-2 text-sm bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                        <div className="font-bold text-rose-600 border-b border-rose-100 pb-1 mb-2">💍 Propose Day Q&A</div>
                        {text.split("|")[0].replace("Propose Day Activity Log: ", "").split(", ").map((logItem, i) => {
                            if (logItem.includes("Q")) {
                                const parts = logItem.split(":");
                                return (
                                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-rose-100 shadow-sm">
                                        <span className="font-bold text-rose-700 bg-rose-100 px-2 rounded-md text-xs py-0.5">{parts[0].trim()}</span>
                                        <span className="text-gray-800">{parts.slice(1).join(":").trim()}</span>
                                    </div>
                                )
                            }
                            return null;
                        })}
                    </div>
                )}

                {hasYes && (
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-200 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 text-6xl opacity-10 rotate-12">💍</div>
                        <h3 className="text-2xl font-bold text-rose-600 mb-2 animate-pulse">SHE SAID YES! 💍</h3>
                        <p className="text-gray-600 italic text-sm">"Proposal Accepted on Propose Day"</p>
                        <div className="mt-2 text-xs bg-white inline-block px-3 py-1 rounded-full text-rose-400 font-bold border border-rose-100">
                            Forever & Always ❤️
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 3. CHOCOLATE DAY
    if (day === DayType.CHOCOLATE) {
        const hasLog = text.includes("Activity Log");
        const sweetnessMatch = text.match(/Sweetness: (\d+)%/);
        const sweetness = sweetnessMatch ? parseInt(sweetnessMatch[1]) : 100;

        return (
            <div className="space-y-4">
                {hasLog && (
                    <div className="space-y-2 text-sm bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                        <div className="font-bold text-amber-600 border-b border-amber-100 pb-1 mb-2">🍫 Chocolate Day Q&A</div>
                        {text.split("|")[0].replace("Chocolate Day Activity Log: ", "").split(", ").map((logItem, i) => {
                            if (logItem.includes("Q")) {
                                const parts = logItem.split(":");
                                return (
                                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-100 shadow-sm">
                                        <span className="font-bold text-amber-700 bg-amber-100 px-2 rounded-md text-xs py-0.5">{parts[0].trim()}</span>
                                        <span className="text-gray-800">{parts.slice(1).join(":").trim()}</span>
                                    </div>
                                )
                            }
                            return null;
                        })}
                    </div>
                )}

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <span>🍫</span> Chocolate Day Sweetness
                    </h3>
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-600 bg-amber-200">
                                Sweet Level
                            </span>
                            <span className="text-xs font-semibold inline-block text-amber-600">
                                {sweetness}%
                            </span>
                        </div>
                        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-amber-200">
                            <div style={{ width: `${sweetness}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 transition-all duration-1000 ease-out"></div>
                        </div>
                        <p className="text-center text-amber-700 font-hand text-lg">"You are {sweetness}% sweet!"</p>
                    </div>
                </div>
            </div>
        );
    }
    // 4. TEDDY DAY
    if (day === DayType.TEDDY) {
        const hasLog = text.includes("Activity Log");
        const teddyMatch = text.match(/Selected Teddy: (.+) \(/);
        const teddyName = teddyMatch ? teddyMatch[1] : "Cute Bear";

        return (
            <div className="space-y-4">
                {hasLog && (
                    <div className="space-y-2 text-sm bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                        <div className="font-bold text-orange-600 border-b border-orange-100 pb-1 mb-2">🧸 Teddy Day Q&A</div>
                        {text.split("|")[0].replace("Teddy Day Activity Log: ", "").split(", ").map((logItem, i) => {
                            if (logItem.includes("Q")) {
                                const parts = logItem.split(":");
                                return (
                                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-orange-100 shadow-sm">
                                        <span className="font-bold text-orange-700 bg-orange-100 px-2 rounded-md text-xs py-0.5">{parts[0].trim()}</span>
                                        <span className="text-gray-800">{parts.slice(1).join(":").trim()}</span>
                                    </div>
                                )
                            }
                            return null;
                        })}
                    </div>
                )}

                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 flex items-center gap-4">
                    <div className="text-5xl bg-white p-2 rounded-full shadow-sm">🧸</div>
                    <div>
                        <h3 className="font-bold text-orange-800">Teddy Day Choice</h3>
                        <p className="text-gray-700">Selected: <span className="font-bold text-orange-600">{teddyName}</span></p>
                    </div>
                </div>
            </div>
        );
    }

    // 5. PROMISE DAY
    if (day === DayType.PROMISE) {
        const hasLog = text.includes("Activity Log");
        const promisesMatch = text.match(/Promises Made: (.+) \(/);
        const promisesList = promisesMatch ? promisesMatch[1].split(', ') : [];

        return (
            <div className="space-y-4">
                {hasLog && (
                    <div className="space-y-2 text-sm bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                        <div className="font-bold text-blue-600 border-b border-blue-100 pb-1 mb-2">🤝 Promise Day Q&A</div>
                        {text.split("|")[0].replace("Promise Day Activity Log: ", "").split(", ").map((logItem, i) => {
                            if (logItem.includes("Q")) {
                                const parts = logItem.split(":");
                                return (
                                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-100 shadow-sm">
                                        <span className="font-bold text-blue-700 bg-blue-100 px-2 rounded-md text-xs py-0.5">{parts[0].trim()}</span>
                                        <span className="text-gray-800">{parts.slice(1).join(":").trim()}</span>
                                    </div>
                                )
                            }
                            return null;
                        })}
                    </div>
                )}

                {promisesList.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                            <span>📜</span> Promises Kept
                        </h3>
                        <ul className="space-y-2">
                            {promisesList.map((p, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-blue-500 mt-0.5">✓</span>
                                    <span>{p}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    // 6. HUG DAY
    if (day === DayType.HUG) {
        const hasLog = text.includes("Activity Log");

        return (
            <div className="space-y-4">
                {hasLog && (
                    <div className="space-y-2 text-sm bg-pink-50/50 p-3 rounded-xl border border-pink-100">
                        <div className="font-bold text-pink-600 border-b border-pink-100 pb-1 mb-2">🤗 Hug Day Q&A</div>
                        {text.split("|")[0].replace("Hug Day Activity Log: ", "").split(", ").map((logItem, i) => {
                            if (logItem.includes("Q")) {
                                const parts = logItem.split(":");
                                return (
                                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-pink-100 shadow-sm">
                                        <span className="font-bold text-pink-700 bg-pink-100 px-2 rounded-md text-xs py-0.5">{parts[0].trim()}</span>
                                        <span className="text-gray-800">{parts.slice(1).join(":").trim()}</span>
                                    </div>
                                )
                            }
                            return null;
                        })}
                    </div>
                )}

                <div className="bg-gradient-to-r from-pink-100 to-rose-100 p-4 rounded-xl border border-pink-200 flex items-center gap-4">
                    <div className="text-4xl bg-white p-3 rounded-full shadow-sm animate-pulse">🫂</div>
                    <div>
                        <h3 className="font-bold text-pink-800">Virtual Hug Sent!</h3>
                        <p className="text-sm text-gray-600">Warmest hug delivered safely.</p>
                    </div>
                </div>
            </div>
        );
    }

    // 7. KISS DAY
    if (day === DayType.KISS) {
        const hasLog = text.includes("Activity Log");
        const countMatch = text.match(/Sent (\d+) Kisses!/);
        const count = countMatch ? countMatch[1] : "Lots of";

        return (
            <div className="space-y-4">
                {hasLog && (
                    <div className="space-y-2 text-sm bg-red-50/50 p-3 rounded-xl border border-red-100">
                        <div className="font-bold text-red-600 border-b border-red-100 pb-1 mb-2">💋 Kiss Day Q&A</div>
                        {text.split("|")[0].replace("Kiss Day Activity Log: ", "").split(", ").map((logItem, i) => {
                            if (logItem.includes("Q")) {
                                const parts = logItem.split(":");
                                return (
                                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-red-100 shadow-sm">
                                        <span className="font-bold text-red-700 bg-red-100 px-2 rounded-md text-xs py-0.5">{parts[0].trim()}</span>
                                        <span className="text-gray-800">{parts.slice(1).join(":").trim()}</span>
                                    </div>
                                )
                            }
                            return null;
                        })}
                    </div>
                )}

                <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-8xl opacity-10 rotate-12">💋</div>
                    <h3 className="font-bold text-red-800 text-2xl mb-1">{count}</h3>
                    <p className="text-gray-600 text-sm uppercase tracking-widest font-bold">Kisses Sent</p>
                    <div className="flex justify-center gap-1 mt-2 text-xl">
                        <span>😘</span><span>💋</span><span>😽</span>
                    </div>
                </div>
            </div>
        );
    }

    // DEFAULT FALLBACK
    return (
        <p className="text-gray-800 font-hand text-lg leading-relaxed border-l-4 border-gray-300 pl-4 italic">
            "{text}"
        </p>
    );
};

export default ConfessionRenderer;
