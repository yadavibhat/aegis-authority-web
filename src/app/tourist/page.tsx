'use client';
import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useRouter } from 'next/navigation';
import {
    Bell,
    Map as MapIcon,
    AlertTriangle,
    Users,
    Settings,
    Shield,
    Calendar,
    MapPin,
    CheckCircle,
    Clock,
    Watch,
    Activity,
    Fingerprint,
    WalletCards,
    Lock,
    BatteryMedium,
    HeartPulse,
    LogOut,
    Radio
} from 'lucide-react';

export default function TouristScreen() {
    const router = useRouter();
    const [sosSent, setSosSent] = useState(false);
    const [activeTab, setActiveTab] = useState('personnel');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            // Hardcoded to fetch history uniquely associated with this device/profile.
            // Note: In real app, associate this with the user's clerk_user_id.
            try {
                const res = await fetch('/api/admin/alerts');
                const data = await res.json();
                if (res.ok && data) setHistory(data.slice(0, 6));
            } catch(e) {}
        };
        fetchHistory();
        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSos = async () => {
        try {
            await fetch('/api/wearable/AEGIS_BAND_01/sos', { method: 'POST' });
            setSosSent(true);
            setTimeout(() => setSosSent(false), 5000); // Visual reset after 5s
        } catch (e) {
            console.error("SOS transmission failed", e);
        }
    };

    return (
        <div className="h-screen flex flex-col font-sans relative overflow-hidden bg-slate-50">

            {/* TOP BAR */}
            <header className="h-[52px] bg-[#000080] flex items-center justify-between px-8 z-50 border-b border-slate-700 shadow-lg shrink-0">
                <div className="flex items-center gap-12">
                    <h1 className="text-white font-black text-[20px] tracking-tighter uppercase shrink-0">AegisTrack</h1>
                    <div className="hidden sm:block h-6 w-[1px] bg-slate-600"></div>
                    <span className="hidden sm:inline-block text-slate-400 font-bold text-[10px] uppercase tracking-[0.1em]">Tourist Operations Profile</span>
                </div>
                <div className="flex items-center justify-center gap-10 flex-1 px-4">
                    <div className="hidden md:flex items-center gap-10 bg-slate-900/50 px-3 py-1 border border-slate-700 rounded-md">
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
                            <span className="text-white font-mono text-xs">Biometrics Synced</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-12 shrink-0 relative">
                    <div className="flex gap-1.5">
                        <button onClick={() => setShowNotifications(!showNotifications)} className="rounded-md w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-colors">
                            <Bell size={18} />
                            {showNotifications && <span className="absolute top-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                        </button>
                        <button onClick={() => router.push('/')} className="rounded-md w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-colors">
                            <LogOut size={18} />
                        </button>
                    </div>
                    {showNotifications && (
                        <div className="absolute top-12 right-4 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 p-4 z-50">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">System Notifications</h4>
                            <div className="p-3 text-center text-slate-400 text-xs">
                                No active notifications.
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* LEFT SIDEBAR */}
                <aside className="w-[240px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full z-40">
                    <div className="p-5 border-t-4 border-[#000080]">
                        <div className="flex items-center gap-12 mb-10 mt-1">
                            <div className="w-10 h-10 shrink-0 bg-[#000080] rounded-[6px] flex items-center justify-center shadow-md">
                                <Shield className="text-white" size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <div className="font-extrabold text-[13px] uppercase tracking-tight text-[#000080] leading-none mb-1 truncate">Aegis-7</div>
                                <div className="text-[10px] text-slate-500 font-bold tracking-wider truncate">SYSTEMS ACTIVE</div>
                            </div>
                        </div>
                        <nav className="space-y-1.5">
                            <button onClick={() => router.push('/authority')} className={`w-full rounded-[6px] flex items-center gap-10 px-3 h-11 text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 shrink-0 group`}>
                                <MapIcon size={18} className="group-hover:text-[#000080] transition-colors" />
                                <span className="text-[11px] uppercase tracking-wider font-bold">Command Center</span>
                            </button>
                            <button onClick={() => setActiveTab('personnel')} className={`w-full rounded-[6px] flex items-center gap-10 px-3 h-11 font-semibold shadow-md shrink-0 ${activeTab === 'personnel' ? 'bg-[#000080] text-white' : 'text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group'}`}>
                                <Users size={18} className={activeTab === 'personnel' ? 'text-white' : 'group-hover:text-[#000080] transition-colors'} />
                                <span className="text-[11px] uppercase tracking-wider font-bold">Personnel Data</span>
                            </button>
                            <button onClick={() => setActiveTab('security')} className={`w-full rounded-[6px] flex items-center gap-10 px-3 h-11 font-semibold shrink-0 ${activeTab === 'security' ? 'bg-[#000080] text-white' : 'text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group'}`}>
                                <Activity size={18} className={activeTab === 'security' ? 'text-white' : 'group-hover:text-amber-500 transition-colors'} />
                                <span className="text-[11px] uppercase tracking-wider font-bold">Security Logs</span>
                            </button>
                            <div className="py-2">
                                <div className="h-[1px] bg-slate-100 w-full mb-1"></div>
                            </div>
                            <button onClick={() => setActiveTab('system')} className={`w-full rounded-[6px] flex items-center gap-10 px-3 h-11 font-semibold shrink-0 ${activeTab === 'system' ? 'bg-[#000080] text-white' : 'text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group'}`}>
                                <Settings size={18} className={activeTab === 'system' ? 'text-white' : 'group-hover:text-slate-900 transition-colors'} />
                                <span className="text-[11px] uppercase tracking-wider font-bold">System Options</span>
                            </button>
                        </nav>
                    </div>
                    <div className="mt-auto p-5 border-t border-slate-100 bg-slate-50 shrink-0">
                        <div className="flex items-center gap-10">
                            <Lock className="text-amber-600 shrink-0" size={18} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-extrabold text-slate-900 truncate uppercase mt-0.5">Mock Environment</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 overflow-y-auto bg-slate-50 relative">

                    {/* Conditionally Rendered Content based on Active Tab */}
                    {activeTab === 'personnel' && (
                        <>
                            {/* Header Banner Section */}
                            <div className="bg-white border-b border-slate-200 px-10 py-8">
                        <div className="flex items-start justify-between max-w-6xl mx-auto">
                            <div className="flex items-center gap-12">
                                <div className="relative">
                                    <img className="w-24 h-24 rounded-full border border-slate-300 blur-[2px] object-cover grayscale shadow-sm" alt="Blurred Portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQo-OICCZY9Yi1yIbpSHcQZSqmkczWu856US5qgWxb-JEOSblUA6F3re8dsKOXY0x-sN3LcRvvtQNmFnoJ6foU5wR0egh0oX517I-v6QP5A-kAr8S3FpcHYO1oSZJQskSLwJfX2sI4T0dl-vcroRs6DO870nBvCR-dXYYrBKuLTmyqyQxJymC7Ns1VmAi_WU6aphcVPMt-VKj7e1Su0FremWMWhiMoBJjoqfGiM1Qoc1rxSibnd61kY__BK2qQxuuQppD40wZ5QBnE" />
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full border-4 border-white shadow-sm">
                                        <CheckCircle size={16} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-12 mb-3">
                                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Unregistered Subject</h1>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 border border-emerald-500 text-emerald-700 bg-emerald-50 text-[10px] uppercase font-bold tracking-wider rounded-sm shadow-sm">
                                                Risk Factor: LOW
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5"><Calendar size={14} /> 20 Apr - 30 Apr</div>
                                        <div className="flex items-center gap-1.5"><MapPin size={14} /> District-7 Central</div>
                                        <div className="flex items-center gap-1.5"><Shield size={14} /> Auth: 18 Apr</div>
                                    </div>
                                </div>
                            </div>

                            <a 
                                href="/wearable/AEGIS_BAND_01"
                                className="border border-emerald-500 bg-emerald-50 rounded-lg p-12 flex items-center justify-between gap-12 shadow-sm min-w-[240px] cursor-pointer hover:bg-emerald-100/50 transition-colors group"
                                style={{ textDecoration: 'none' }}
                                title="Open Live Wearable Stream">
                                <div className="flex items-center gap-12">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                                        <Watch className="text-emerald-600" size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-emerald-700 font-black text-[11px] uppercase tracking-widest">AEGIS_BAND_01 SYNCED</span>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                            <span className="text-[10px] text-emerald-600 font-mono font-bold">ACTIVE STREAM</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs">
                                    Open ↗
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Data Grids */}
                    <div className="max-w-6xl mx-auto px-10 py-8 grid grid-cols-12 gap-12">

                        {/* LEFT COLUMN */}
                        <div className="col-span-12 lg:col-span-8 space-y-8">

                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="border-b border-slate-100 px-8 py-8 flex items-center gap-10 bg-slate-50/50">
                                    <Fingerprint className="text-[#000080]" size={18} />
                                    <h2 className="text-[#000080] font-black text-xs uppercase tracking-widest">Historical Tracking Data</h2>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {history.length === 0 ? (
                                        <div className="p-10 flex flex-col justify-center items-center text-center space-y-4">
                                            <Activity className="text-slate-300" size={32} />
                                            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Awaiting Data Link</p>
                                        </div>
                                    ) : (
                                        history.map(event => (
                                            <div key={event.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border ${event.type.includes('SOS') || event.type.includes('panic') ? 'bg-red-50 border-red-200 text-red-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                                                            {event.type}
                                                        </span>
                                                        <span className={`text-[10px] uppercase font-bold tracking-widest ${event.status === 'OPEN' ? 'text-red-500' : 'text-slate-400'}`}>
                                                            [{event.status || 'LOGGED'}]
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-mono text-slate-500 mt-2">
                                                        Recorded at LAT: {event.latitude?.toFixed(4)}, LNG: {event.longitude?.toFixed(4)}
                                                    </p>
                                                </div>
                                                <div className="text-[10px] font-mono font-bold text-slate-400 border border-slate-200 px-3 py-1 bg-white rounded shadow-sm">
                                                    {new Date(event.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">



                            {/* SOS Button Area */}
                            <div className="bg-[#1a1a2e] rounded-xl p-1 relative overflow-hidden shadow-lg border border-slate-800">
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 to-transparent"></div>
                                <div className="relative z-10 p-5 flex flex-col gap-12">
                                    <div className="text-center">
                                        <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-1">Wearable Output Sync</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">Test direct communication with the mock AegisTrack control center terminal.</p>
                                    </div>
                                    <button
                                        onClick={handleSos}
                                        className={`w-full rounded-lg h-14 flex items-center justify-center gap-10 text-white font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-lg ${sosSent
                                                ? 'bg-emerald-500 border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                                : 'bg-red-600 hover:bg-red-500 border border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
                                            }`}
                                    >
                                        <Radio size={18} className={sosSent ? "" : "animate-pulse"} />
                                        {sosSent ? 'SIGNAL TRANSMITTED ✓' : 'INITIATE CRISIS PROTOCOL'}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                        </>
                    )}
                    
                    {activeTab === 'security' && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 bg-slate-50 w-full">
                            <Activity size={48} className="mb-6 text-slate-300" />
                            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest mb-2">Security Logs Locked</h2>
                            <p className="text-sm text-center max-w-sm">You do not have clearance to view comprehensive security logs from the tourist profile interface.</p>
                        </div>
                    )}
                    
                    {activeTab === 'system' && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 bg-slate-50 w-full">
                            <Settings size={48} className="mb-6 text-slate-300 transition-transform hover:rotate-90 duration-500" />
                            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest mb-2">System Preferences</h2>
                            <p className="text-sm text-center max-w-sm">Configuration tools are centralized at the Command Center.</p>
                            <button onClick={() => router.push('/authority')} className="mt-6 bg-[#000080] text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-md hover:bg-blue-900 transition-colors">Go to Command Center</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
