'use client';
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  MapPin, 
  Navigation, 
  Phone, 
  Settings, 
  AlertTriangle,
  Info,
  Clock,
  Mic,
  Activity,
  History,
  LifeBuoy,
  Wifi,
  Bell,
  LogOut
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useRouter } from 'next/navigation';
import { Alert, Tourist } from '@/types';

export default function TouristScreen() {
    const router = useRouter();
    const [tourist, setTourist] = useState<Tourist | null>(null);
    const [events, setEvents] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasActivePanic, setHasActivePanic] = useState(false);
    const [sosProcessing, setSosProcessing] = useState(false);

    const fetchEvents = async (tid: string) => {
        const { data, error } = await supabaseBrowser
            .from('alerts')
            .select('*')
            .eq('tourist_id', tid)
            .order('created_at', { ascending: false });

        if (!error && data) {
            const normalized = data.map((a: Alert) => {
                const typeUpper = (a.type || '').toUpperCase();
                const isPanic = ['PANIC', 'SOS', 'FALL_DETECTED', 'FALL'].includes(typeUpper);
                const isOpen = a.resolved === false || a.resolved === null;
                return {
                    ...a,
                    status: isOpen ? 'OPEN' : 'RESOLVED',
                    isPanic
                } as Alert;
            });
            setEvents(normalized);
            
            const activePanic = normalized.some(a => a.status === 'OPEN' && a.isPanic);
            setHasActivePanic(activePanic);
        }
    };

    useEffect(() => {
        const getTourist = async () => {
            try {
                const { data } = await supabaseBrowser.from('tourists').select('*').limit(1).single();
                if (data) {
                    const t = data as Tourist;
                    setTourist(t);
                    await fetchEvents(t.id);
                }
            } catch (err) {
                console.error("Failed to load tourist:", err);
            } finally {
                setLoading(false);
            }
        };

        getTourist();

        // Subscribe to real-time updates for BOTH alerts and the tourist (location/status)
        const alertsChannel = supabaseBrowser
            .channel('tourist-alerts-sync')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'alerts' },
                () => {
                    if (tourist?.id) fetchEvents(tourist.id);
                }
            )
            .subscribe();

        return () => {
            supabaseBrowser.removeChannel(alertsChannel);
        };
    }, [tourist?.id]);

    const triggerSOS = async () => {
        if (!tourist || hasActivePanic || sosProcessing) return;
        
        setSosProcessing(true);
        setHasActivePanic(true); // Immediate UI feedback
        
        try {
            const { error } = await supabaseBrowser.from('alerts').insert({
                tourist_id: tourist.id,
                type: 'PANIC',
                message: 'Immediate Emergency Signal from Mobile Portal',
                latitude: tourist.latitude || 28.6139,
                longitude: tourist.longitude || 77.2090,
                resolved: false,
                metadata: { source: 'portal-app' }
            });

            if (error) throw error;
            await fetchEvents(tourist.id);
        } catch (error) {
            console.error("SOS Transmission Error:", error);
            setHasActivePanic(false);
        } finally {
            setSosProcessing(false);
        }
    };

    if (loading) return (
        <div className="h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
            <Shield size={48} className="text-white/20 animate-pulse" />
            <div className="font-mono uppercase tracking-[0.4em] text-[10px] text-white/40 animate-pulse">
                INITIALIZING AEGIS-SYNC...
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-[#000080] pb-32">
            {/* Header / StatusBar */}
            <div className={`p-6 border-b transition-all duration-1000 sticky top-0 z-50 backdrop-blur-md ${hasActivePanic ? 'bg-red-600/90 border-red-500 shadow-2xl shadow-red-900/40' : 'bg-slate-900/80 border-white/5'}`}>
                <div className="max-w-md mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${hasActivePanic ? 'bg-white text-red-600' : 'bg-[#000080] text-white shadow-lg shadow-blue-900/40'}`}>
                            {hasActivePanic ? <LifeBuoy size={20} className="animate-spin" /> : <Shield size={20} />}
                        </div>
                        <div>
                            <h1 className="text-lg font-black uppercase tracking-tight leading-none mb-1">Aegis Portal</h1>
                            <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${hasActivePanic ? 'bg-white' : 'bg-emerald-500'} animate-pulse`}></span>
                                <p className="text-[9px] font-mono font-bold tracking-widest text-white/50 uppercase">Secure Uplink Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-white/40 hover:text-white transition-colors">
                            <Bell size={20} />
                        </button>
                        <button onClick={() => router.push('/')} className="text-white/40 hover:text-white transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto p-8 pt-12">
                {/* Profile Identity Card */}
                <div className="mb-12">
                    <header className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Authorized Operator</span>
                            <div className="h-px flex-1 bg-white/5"></div>
                        </div>
                        <h2 className="text-5xl font-black uppercase tracking-tighter mb-2 italic">{tourist?.name || 'CITIZEN'}</h2>
                        <p className="text-xs font-mono text-white/40 uppercase tracking-widest">ID: {tourist?.aadhaar || 'UNAVAILABLE'}</p>
                    </header>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-white/30">
                                <Wifi size={14} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Connection</span>
                            </div>
                            <span className="text-xs font-mono font-black text-emerald-400 uppercase">92% Signal</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-white/30">
                                <Activity size={14} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Health</span>
                            </div>
                            <span className="text-xs font-mono font-black text-blue-400 uppercase">SYNCED</span>
                        </div>
                    </div>
                </div>

                {/* MAIN SOS INTERACTIVE */}
                <div className="mb-16 relative">
                    {hasActivePanic && (
                        <div className="absolute -inset-12 bg-red-600/30 blur-[80px] rounded-full animate-pulse z-0"></div>
                    )}
                    
                    <button 
                        onClick={triggerSOS}
                        disabled={hasActivePanic || sosProcessing}
                        className={`relative z-10 w-full aspect-square rounded-[60px] flex flex-col items-center justify-center gap-8 transition-all duration-500 transform active:scale-[0.98] group overflow-hidden border-[12px] group ${
                            hasActivePanic 
                            ? 'bg-red-600 border-red-500 shadow-2xl shadow-red-900/60' 
                            : 'bg-slate-800/50 border-white/5 hover:border-white/10 shadow-emerald-900/10'
                        }`}
                    >
                        {/* Background Animation */}
                        {hasActivePanic && (
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent animate-pulse"></div>
                        )}
                        
                        <div className={`p-10 rounded-full transition-all duration-500 ${
                            hasActivePanic 
                            ? 'bg-white text-red-600 scale-110 shadow-2xl overflow-hidden relative' 
                            : 'bg-white/5 text-white/20 group-hover:bg-red-600/10 group-hover:text-red-500'
                        }`}>
                            <AlertTriangle size={80} className={`${hasActivePanic ? 'animate-bounce' : 'group-hover:scale-110 transition-transform'}`} />
                        </div>

                        <div className="text-center relative">
                            <span className={`block text-5xl font-black tracking-tighter uppercase mb-2 ${hasActivePanic ? 'text-white' : 'text-white/80'}`}>
                                {hasActivePanic ? 'HELP SENT' : 'SEND SOS'}
                            </span>
                            <div className="flex items-center justify-center gap-3">
                                <span className={`w-1 h-1 rounded-full ${hasActivePanic ? 'bg-white' : 'bg-white/20'}`}></span>
                                <span className={`text-[11px] font-mono font-bold tracking-[0.4em] uppercase ${hasActivePanic ? 'text-white/70' : 'text-white/20'}`}>
                                    {hasActivePanic ? 'AUTHORITY CONTACTED' : 'INSTANT BROADCAST'}
                                </span>
                                <span className={`w-1 h-1 rounded-full ${hasActivePanic ? 'bg-white' : 'bg-white/20'}`}></span>
                            </div>
                        </div>

                        {/* Scan Line Effect for Panic State */}
                        {hasActivePanic && (
                            <div className="absolute inset-0 w-full h-1 bg-white/20 blur-sm animate-[scan_2s_linear_infinite]"></div>
                        )}
                    </button>
                    
                    {!hasActivePanic && (
                        <div className="flex flex-col items-center mt-10 space-y-4 opacity-40">
                             <div className="flex items-center gap-3">
                                <Info size={14} />
                                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Biometric Authentication Required</span>
                             </div>
                             <p className="text-[10px] text-center uppercase tracking-widest leading-loose">
                                Triggering SOS will notify all nearby units <br/>
                                and activate high-res tracking protocols.
                             </p>
                        </div>
                    )}
                </div>

                {/* SECONDARY ACTIONS */}
                <div className="grid grid-cols-2 gap-6 mb-16">
                    <button className="bg-white/5 border border-white/5 p-8 rounded-3xl flex flex-col items-center gap-4 group hover:bg-white/10 transition-all border-b-2 hover:border-b-blue-500">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 group-hover:text-blue-400 group-hover:bg-blue-400/10 transition-all">
                            <Mic size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white">Emergency Voicelog</span>
                    </button>
                    <button className="bg-white/5 border border-white/5 p-8 rounded-3xl flex flex-col items-center gap-4 group hover:bg-white/10 transition-all border-b-2 hover:border-b-emerald-500">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 group-hover:text-emerald-400 group-hover:bg-emerald-400/10 transition-all">
                            <MapPin size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white">Request Safehouse</span>
                    </button>
                </div>

                {/* EVENT TIMELINE */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <History size={16} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">System History</h3>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                    </div>

                    <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-0 before:w-[1px] before:bg-white/5">
                        {events.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4 border-2 border-dashed border-white/5 rounded-[40px]">
                                <Clock size={32} className="text-white/10" />
                                <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">No incident logs recorded</span>
                            </div>
                        ) : (
                            events.map((event) => (
                                <div key={event.id} className="relative pl-12 group">
                                    <div className={`absolute left-0 top-1.5 w-[31px] h-[31px] rounded-full border-4 border-slate-900 z-10 flex items-center justify-center transition-colors shadow-xl ${
                                        event.isPanic && event.status === 'OPEN' 
                                        ? 'bg-red-500 animate-pulse' 
                                        : 'bg-slate-800'
                                    }`}>
                                        <div className={`w-2 h-2 rounded-full ${event.isPanic && event.status === 'OPEN' ? 'bg-white' : 'bg-white/30'}`}></div>
                                    </div>
                                    
                                    <div className="bg-white/5 border border-white/5 p-6 rounded-3xl group-hover:bg-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                                                        event.isPanic ? 'bg-red-600/10 border-red-500/30 text-red-500' : 'bg-emerald-600/10 border-emerald-500/30 text-emerald-500'
                                                    }`}>
                                                        {event.type}
                                                    </span>
                                                    {event.status === 'OPEN' && (
                                                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]"></span>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] uppercase font-bold tracking-widest ${event.status === 'OPEN' ? 'text-red-500' : 'text-slate-500'}`}>
                                                    {event.status === 'OPEN' ? 'CRITICAL / UNRESOLVED' : 'STABILIZED / CLOSED'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-mono text-white/30 font-bold">
                                                {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed font-medium">
                                            {event.message}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase">
                                                <MapPin size={10} /> {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation Dock */}
            <div className="fixed bottom-0 left-0 right-0 p-8 z-[100] pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-2 flex justify-between shadow-2xl shadow-black/50">
                    <button className="flex flex-1 flex-col items-center gap-1 p-4 text-blue-500 bg-white/5 rounded-[24px]">
                        <Shield size={22} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Aegis</span>
                    </button>
                    <button className="flex flex-1 flex-col items-center gap-1 p-4 text-white/30 hover:text-white transition-colors">
                        <Navigation size={22} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Zones</span>
                    </button>
                    <button className="flex flex-1 flex-col items-center gap-1 p-4 text-white/30 hover:text-white transition-colors">
                        <Phone size={22} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Contact</span>
                    </button>
                    <button className="flex flex-1 flex-col items-center gap-1 p-4 text-white/30 hover:text-white transition-colors">
                        <Settings size={22} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Nodes</span>
                    </button>
                </div>
            </div>

            <style jsx global>{`
                @keyframes scan {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(1000%); }
                }
            `}</style>
        </div>
    );
}
