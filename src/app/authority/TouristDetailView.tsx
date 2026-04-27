import React, { useEffect, useState } from 'react';
import { User, Activity, AlertTriangle, ArrowLeft, Watch, Radio } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { Alert, Tourist } from '@/types';

export default function TouristDetailView({ tourist, onBack }: { tourist: Tourist, onBack: () => void }) {
    const [localAlerts, setLocalAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!tourist?.id) return;

        const fetchAlerts = async () => {
            const { data, error } = await supabaseBrowser
                .from('alerts')
                .select('*')
                .eq('tourist_id', tourist.id)
                .order('created_at', { ascending: false })
                .limit(100);
            
            if (!error && data) {
                setLocalAlerts(data.map(a => {
                    const typeUpper = (a.type || '').toUpperCase();
                    const isPanic = ['PANIC', 'SOS', 'FALL_DETECTED', 'FALL'].includes(typeUpper);
                    const isOpen = a.resolved === false || a.resolved === null;
                    return {
                        ...a,
                        status: isOpen ? 'OPEN' : 'RESOLVED',
                        isPanic
                    } as Alert;
                }));
            }
            setLoading(false);
        };

        fetchAlerts();

        // Realtime subscription for this specific tourist
        const channel = supabaseBrowser
            .channel(`detail-alerts-${tourist.id}`)
            .on(
                'postgres_changes',
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'alerts', 
                    filter: `tourist_id=eq.${tourist.id}` 
                },
                (payload) => {
                    const typeUpper = (payload.new.type || '').toUpperCase();
                    const isPanic = ['PANIC', 'SOS', 'FALL_DETECTED', 'FALL'].includes(typeUpper);
                    const isOpen = payload.new.resolved === false || payload.new.resolved === null;
                    const normalized: Alert = {
                        ...(payload.new as Alert),
                        status: isOpen ? 'OPEN' : 'RESOLVED',
                        isPanic
                    };
                    setLocalAlerts(prev => [normalized, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabaseBrowser.removeChannel(channel);
        };
    }, [tourist?.id]);

    const hasActivePanic = localAlerts.some((a: Alert) => a.status === 'OPEN' && ['PANIC', 'SOS', 'FALL_DETECTED', 'FALL'].includes((a.type || '').toUpperCase()));

    return (
        <div className="flex-1 overflow-auto p-10 bg-slate-50 relative">
            <button onClick={onBack} className="absolute top-10 right-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 px-4 py-2 rounded-md shadow-sm z-10">
                <ArrowLeft size={14} /> Back to Directory
            </button>
            <div className="max-w-4xl mx-auto mt-4">
                <div className="flex items-center gap-6 mb-10 border-b border-slate-300 pb-6 text-[#000080]">
                    <div className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${hasActivePanic ? 'bg-red-600 animate-panic-pulse' : 'bg-[#000080]'}`}>
                        {hasActivePanic ? <Radio className="text-white animate-pulse" size={40} /> : <User className="text-white" size={40} />}
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tight uppercase leading-none mb-2">{tourist.name}</h2>
                        <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em]">
                            AADHAAR REF: {tourist.aadhaar || 'UNAVAILABLE'} | DB-ID: {tourist.id.substring(0,8)}...
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Device Block */}
                    <div className="bg-white border text-center border-slate-200 p-8 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                        <Watch className="text-blue-500 mx-auto mb-4" size={32} />
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Hardware Module</h3>
                        <p className="text-lg font-mono font-black text-slate-800">{tourist.device_id || 'NOT LINKED'}</p>
                    </div>
                    
                    {/* Status Block */}
                    <div className={`border text-center p-8 shadow-sm rounded-xl transition-all duration-500 ${hasActivePanic ? 'bg-red-50 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-emerald-50 border-emerald-200'}`}>
                        <Activity className={hasActivePanic ? 'text-red-500 mx-auto mb-4 animate-pulse' : 'text-emerald-500 mx-auto mb-4'} size={32} />
                        <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${hasActivePanic ? 'text-red-500' : 'text-emerald-600/70'}`}>Live Assessment</h3>
                        <p className={`text-xl font-black tracking-wider uppercase ${hasActivePanic ? 'text-red-600' : 'text-emerald-700'}`}>
                            {hasActivePanic ? 'CRITICAL EMERGENCY' : 'STABLE'}
                        </p>
                    </div>
                </div>

                {/* Secure Event Log */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="text-slate-400" size={16} />
                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Incident Record</h3>
                        </div>
                        {loading && <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>}
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                        {localAlerts.length === 0 && !loading ? (
                            <div className="p-10 text-center text-slate-400 font-mono text-[11px] uppercase tracking-widest bg-white">
                                No historical incidents linked to this profile.
                            </div>
                        ) : (
                            localAlerts.map((alert: Alert) => {
                                const isPanic = ['PANIC', 'SOS', 'FALL_DETECTED', 'FALL'].includes((alert.type || '').toUpperCase());
                                return (
                                    <div key={alert.id} className={`p-6 hover:bg-slate-50 transition-colors flex justify-between items-start ${alert.status === 'OPEN' ? 'bg-red-50/20' : ''}`}>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border ${isPanic ? 'bg-red-50 border-red-200 text-red-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                                                    {alert.type}
                                                </span>
                                                <span className={`text-[10px] uppercase font-bold tracking-widest ${alert.status === 'OPEN' ? 'text-red-500' : 'text-slate-400'}`}>
                                                    [{alert.status}]
                                                </span>
                                            </div>
                                            <p className="text-xs font-mono text-slate-500 mt-2">
                                                Recorded at LAT: {alert.latitude?.toFixed(4)}, LNG: {alert.longitude?.toFixed(4)}
                                            </p>
                                        </div>
                                        <div className="text-[10px] font-mono font-bold text-slate-400 border border-slate-200 px-3 py-1 bg-white rounded shadow-sm">
                                            {new Date(alert.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
