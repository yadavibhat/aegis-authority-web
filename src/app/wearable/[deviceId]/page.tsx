'use client';
import React, { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { Activity, MapPin, Watch, AlertTriangle, BatteryMedium, Cpu, Globe } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function WearableDeviceView() {
    const params = useParams();
    const deviceId = params.deviceId as string || 'Unknown Device';
    const [alerts, setAlerts] = useState<any[]>([]);
    const [status, setStatus] = useState('Initializing Handshake...');
    const [tourist, setTourist] = useState<any>(null);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            setStatus('RESTRICTED: Missing Supabase URL. Add NEXT_PUBLIC_SUPABASE_URL to .env.local');
            return;
        }

        let channel: any;

        const initConnection = async () => {
            try {
                // 1. Fetch the tourist linked to this device ID
                const { data: tourists, error } = await supabaseBrowser
                    .from('tourists')
                    .select('*')
                    .eq('device_id', deviceId)
                    .limit(1);
                
                if (!tourists || tourists.length === 0) {
                    setStatus(`NO TOURIST LINKED TO DEVICE: ${deviceId}`);
                    subscribeToAlerts(null);
                    return;
                }

                const t = tourists[0];
                setTourist(t);
                setStatus(`Connected to Realtime Uplink — Linked to: ${t.full_name || t.id}`);
                subscribeToAlerts(t);
            } catch (e) {
                setStatus('Error establishing database connection.');
            }
        };

        const subscribeToAlerts = (t: any | null) => {
            // Subscribe to all alerts, and filter on the client to avoid schema issues 
            // (e.g. if the database uses tourist_id vs clerk_user_id)
            channel = supabaseBrowser
                .channel(`public:alerts-${deviceId}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'alerts'
                }, (payload) => {
                    const alert = payload.new;
                    if (t) {
                        if (alert.clerk_user_id === t.clerk_user_id || alert.tourist_id === t.id) {
                            setAlerts((prev) => [alert, ...prev]);
                        }
                    } else {
                        // If no tourist found, show everything just for demo flexibility
                        setAlerts((prev) => [alert, ...prev]);
                    }
                })
                .subscribe();
        };

        initConnection();

        return () => {
            if (channel) supabaseBrowser.removeChannel(channel);
        };
    }, [deviceId]);

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
            </main>
        </div>
    );
}
