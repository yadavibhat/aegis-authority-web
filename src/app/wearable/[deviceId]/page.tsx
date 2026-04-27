'use client';
import React, { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { Activity, MapPin, Watch, AlertTriangle, BatteryMedium, Cpu, Globe, Radio } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function WearableDeviceView() {
    const params = useParams();
    const deviceId = params.deviceId as string || 'Unknown Device';
    const [alerts, setAlerts] = useState<any[]>([]);
    const [status, setStatus] = useState('Initializing Handshake...');
    const [tourist, setTourist] = useState<any>(null);
    const [sosSent, setSosSent] = useState(false);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            setStatus('RESTRICTED: Missing Supabase URL. Add NEXT_PUBLIC_SUPABASE_URL to .env.local');
            return;
        }

        const initConnection = async () => {
            try {
                // 1. Fetch the tourist linked to this device ID from our unified mock backend
                const res = await fetch(`/api/wearable/${deviceId}/status`);
                const json = await res.json();

                if (!res.ok || !json.tourist) {
                    setStatus(`NO TOURIST LINKED TO DEVICE: ${deviceId}`);
                    return;
                }

                const t = json.tourist;
                setTourist(t);
                setStatus(`Connected to Uplink — Linked to: ${t.name || t.id}`);
            } catch (e) {
                setStatus('Error establishing uplink connection.');
            }
        };

        initConnection();
    }, [deviceId]);

    useEffect(() => {
        if (!tourist) return;

        // Subscribe to real-time alerts for this tourist
        const channel = supabaseBrowser
            .channel(`public:alerts:tourist_id=eq.${tourist.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'alerts',
                    filter: `tourist_id=eq.${tourist.id}`
                },
                (payload) => {
                    setAlerts(prev => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabaseBrowser.removeChannel(channel);
        };
    }, [tourist]);

    const handleSos = async () => {
        try {
            const res = await fetch(`/api/wearable/${deviceId}/sos`, { method: 'POST' });
            if (res.ok) {
                setSosSent(true);
                setTimeout(() => setSosSent(false), 5000);
            }
        } catch (e) {
            console.error("SOS transmission failed", e);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 text-slate-900 font-sans p-10 flex flex-col">
            <header className="flex justify-between items-start mb-10 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-widest flex items-center gap-4">
                        <Watch className="text-blue-600" size={32} />
                        Live Wearable Feedback
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm font-mono tracking-widest">DEVICE ID: {deviceId}</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg max-w-sm shadow-sm">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse ${status.includes('RESTRICTED') || status.includes('NO TOURIST') ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${status.includes('RESTRICTED') || status.includes('NO TOURIST') ? 'text-red-600' : 'text-green-600'}`}>{status}</span>
                </div>
            </header>

            <main className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
                {/* Realtime alert feed */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden flex flex-col flex-1">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 font-bold"><AlertTriangle size={14} className="text-red-500"/> Real-time Critical Alerts Stream</h2>
                    </div>
                    
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        {alerts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-70 p-10">
                                <Watch size={48} className={status.includes('RESTRICTED') ? '' : 'animate-pulse text-blue-400'} />
                                <p className="text-xs uppercase tracking-widest font-bold text-center text-slate-500">Listening for socket broadcasts...</p>
                                <p className="text-[10px] text-center max-w-sm text-slate-400">When this device posts an emergency signal to Supabase, it will appear here automatically without a page reload.</p>
                            </div>
                        ) : (
                            alerts.map((alert, idx) => (
                                <div key={idx} className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg flex items-start justify-between shadow-sm">
                                    <div className="space-y-1">
                                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-[9px] uppercase tracking-[0.2em] font-black rounded border border-red-200 mb-2">{alert.type || 'EMERGENCY EVENT'}</span>
                                        <div className="text-slate-900 font-bold tracking-wide">{alert.message || 'Automated hardware trigger'}</div>
                                        <div className="text-slate-500 text-[10px] font-mono mt-1">COORDS: {alert.latitude?.toFixed(4) || '???'}, {alert.longitude?.toFixed(4) || '???'} | STATUS: {alert.status || 'OPEN'}</div>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono tracking-widest bg-white border border-gray-200 px-3 py-1 rounded shadow-sm">
                                        {new Date(alert.created_at || Date.now()).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Simulated Panic Button */}
                <div className="mt-8 bg-[#1a1a2e] rounded-xl p-8 relative overflow-hidden shadow-2xl border border-slate-800">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600 to-transparent animate-pulse"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-left w-full">
                            <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <Radio size={16} className="text-red-500 animate-pulse" /> Emergency Transmission Override
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium max-w-md">Simulate an immediate hardware-level crisis trigger. This will bypass standard protocols and notify all active command centers.</p>
                        </div>
                        <button
                            onClick={handleSos}
                            disabled={sosSent}
                            className={`w-full md:w-auto px-10 rounded-lg h-16 flex items-center justify-center gap-10 text-white font-black text-xs uppercase tracking-[0.3em] transition-all duration-300 shadow-lg ${sosSent
                                    ? 'bg-emerald-500 border border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                                    : 'bg-red-600 hover:bg-red-500 border border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)]'
                                }`}
                        >
                            {sosSent ? 'SIGNAL SENT' : 'TRIGGER SOS PANIC'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
