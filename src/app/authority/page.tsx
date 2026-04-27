'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Bell, 
  LogOut, 
  Shield, 
  Map as MapIcon, 
  AlertTriangle, 
  Users, 
  UserPlus, 
  Settings,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Radio
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { Alert, Tourist, DashboardData, Zone } from '@/types';

const LiveMapDynamic = dynamic(() => import('../../components/LiveMap'), { ssr: false });
import AddTouristView from './AddTouristView';
import SettingsView from './SettingsView';
import TouristDetailView from './TouristDetailView';

export default function AuthorityScreen() {
   const router = useRouter();
   const [data, setData] = useState<DashboardData>({ alerts: [], tourists: [], locations: [], zones: [] });
   const [loading, setLoading] = useState(true);
   const [locationParams, setLocationParams] = useState({ loaded: false, center: [28.6139, 77.2090] as [number, number] });
   const [activeView, setActiveView] = useState<'map' | 'tourists' | 'add-tourist' | 'settings' | 'tourist-detail'>('map');
   const [selectedTouristId, setSelectedTouristId] = useState<string | null>(null);
   const [rightPanelTab, setRightPanelTab] = useState<'alerts'|'devices'>('alerts');
   const [lastNotification, setLastNotification] = useState<Alert | null>(null);
   const [showNotification, setShowNotification] = useState(false);
   const [latency, setLatency] = useState<number | null>(null);
   const [systemStatus, setSystemStatus] = useState<'OK' | 'DEGRADED' | 'OFFLINE'>('OK');
   const isFetching = useRef(false);

    const fetchLiveFeed = async (retryCount = 0) => {
        if (isFetching.current) return;
        isFetching.current = true;
        
        const start = performance.now();
        try {
            const res = await fetch('/api/admin/live', { 
                cache: 'no-store'
            });
            
            const end = performance.now();
            setLatency(Math.round(end - start));
            
            if (res.ok) {
                const result: DashboardData = await res.json();
                setData(result);
                setSystemStatus('OK');
            } else {
                console.warn(`Live API non-OK (${res.status})`);
                setSystemStatus('DEGRADED');
            }
        } catch (e: any) {
            console.error("Network Error in fetchLiveFeed:", e);
            
            // Exponential backoff retry
            if (retryCount < 2) {
                const delay = (retryCount + 1) * 2000;
                setTimeout(() => {
                    isFetching.current = false;
                    fetchLiveFeed(retryCount + 1);
                }, delay);
                return;
            }

            setSystemStatus('OFFLINE');
            setLatency(null);
        } finally {
            isFetching.current = false;
            setLoading(false);
        }
    };

    // Debounced version of the fetch to prevent storming the server
    const debouncedFetch = useRef<NodeJS.Timeout | null>(null);
    const triggerFetch = () => {
        if (debouncedFetch.current) clearTimeout(debouncedFetch.current);
        debouncedFetch.current = setTimeout(fetchLiveFeed, 500);
    };

    useEffect(() => {
        const init = async () => {
            await fetchLiveFeed();
        };
        init();
    }, []);

    useEffect(() => {
        const fetchIPLocation = async () => {
            try {
                const res = await fetch('https://ipapi.co/json/');
                if (res.ok) {
                    const loc = await res.json();
                    if (loc.latitude && loc.longitude) {
                        setLocationParams({ loaded: true, center: [loc.latitude, loc.longitude] });
                        return;
                    }
                }
            } catch(e) {
                console.warn("IP Geolocation failed:", e);
            }
            alert("Location utterly blocked by OS and network. Defaulting to New Delhi.");
            setLocationParams({ loaded: true, center: [28.6139, 77.2090] });
        };

        // Request exact user position without high accuracy timeouts
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocationParams({ loaded: true, center: [pos.coords.latitude, pos.coords.longitude] }),
                (err) => {
                    console.log("Browser location blocked or timed out, trying IP fallback...", err);
                    fetchIPLocation();
                },
                { timeout: 8000, enableHighAccuracy: false }
            );
        } else {
            fetchIPLocation();
        }

        // Instant updates via Supabase Realtime
         const alertsChannel = supabaseBrowser.channel('global-alerts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
                const newAlert = payload.new as Alert;
                console.log("New Alert detected:", newAlert);
                
                // If it's a critical alert, show pop-up notification
                if (['PANIC', 'SOS', 'FALL_DETECTED', 'FALL'].includes((newAlert.type || '').toUpperCase())) {
                    setLastNotification(newAlert);
                    setShowNotification(true);
                    
                    // Auto-hide after 10 seconds
                    setTimeout(() => setShowNotification(false), 10000);
                }
                
                triggerFetch();
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'alerts' }, () => {
                console.log("Alert update detected, refreshing feed...");
                triggerFetch();
            })
            .subscribe();

        const locationsChannel = supabaseBrowser.channel('global-locations')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'locations' }, () => {
                console.log("Location update detected, refreshing map...");
                triggerFetch();
            })
            .subscribe();

        const interval = setInterval(triggerFetch, 15000); // 15s polling fallback
        return () => {
            clearInterval(interval);
            if (debouncedFetch.current) clearTimeout(debouncedFetch.current);
            supabaseBrowser.removeChannel(alertsChannel);
            supabaseBrowser.removeChannel(locationsChannel);
        };
    }, []);

    const isIST = (dateStr: string) => {
        if (!dateStr) return '---';
        const date = dateStr.includes('Z') || dateStr.includes('+') 
            ? new Date(dateStr) 
            : new Date(dateStr.replace(' ', 'T') + 'Z');
            
        return date.toLocaleTimeString('en-IN', { 
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

   const handleResolveAlert = async (id: string) => {
       await fetch(`/api/admin/alerts/${id}/resolve`, { method: 'POST' });
       fetchLiveFeed();
   };

   const openAlerts = data?.alerts?.filter((a: Alert) => a.status === 'OPEN') || [];
   const activeTouristsWithCoords = data?.tourists?.filter((t: Tourist) => t.latitude && t.longitude) || [];

  return (
    <>
      <div className="h-screen flex flex-col font-sans relative overflow-hidden bg-slate-900">
      
{/* TOP BAR */}
<header className="h-[52px] bg-[#000080] flex items-center justify-between px-8 z-50 border-b border-slate-700 shadow-lg shrink-0">
    <div className="flex items-center gap-12">
        <h1 className="text-white font-black text-[20px] tracking-tighter uppercase shrink-0">AegisTrack</h1>
        <div className="hidden sm:block h-6 w-[1px] bg-slate-600"></div>
        <span className="hidden sm:inline-block text-slate-400 font-bold text-[10px] uppercase tracking-[0.1em]">Authority Control Centre</span>
    </div>
    <div className="flex items-center justify-center gap-10 flex-1 px-4">
        <div className="hidden md:flex items-center gap-10 bg-slate-900/50 px-3 py-1 border border-slate-700 rounded-md">
            <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
                <span className="text-white font-mono text-xs">Connected</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-700"></div>
            <div className="flex gap-12 shrink-0">
                <span className="text-slate-300 text-xs font-mono">NODES: {data?.locations?.length || 0}</span>
                <span className="text-slate-300 text-xs font-mono uppercase">RTT: {latency ? `${latency}ms` : '---'}</span>
            </div>
        </div>
    </div>
    <div className="flex items-center gap-12 shrink-0">
        <div className="hidden lg:block text-slate-300 font-mono text-xs font-medium tracking-wider">
            LIVE SYSTEM
        </div>
         <div className="flex gap-1.5">
            <button onClick={() => setRightPanelTab('alerts')} className="rounded-md w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-colors relative">
                <Bell size={18} />
                {openAlerts.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
            </button>
            <button onClick={() => router.push('/login')} className="rounded-md w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-colors">
                <LogOut size={18} />
            </button>
        </div>
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
            <button onClick={() => setActiveView('map')} className={`w-full rounded-[6px] flex items-center gap-10 px-3 h-11 ${activeView === 'map' ? 'bg-[#000080] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200'} shrink-0 group`}>
                <MapIcon size={18} className={activeView === 'map' ? 'text-white' : 'text-slate-600'} />
                <span className={`text-[11px] uppercase tracking-wider font-bold ${activeView === 'map' ? 'text-white' : ''}`}>Live Map</span>
            </button>
             <button onClick={() => {setActiveView('map'); setRightPanelTab('alerts');}} className="w-full rounded-[6px] flex items-center justify-between px-3 h-11 text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 shrink-0 group">
                <div className="flex items-center gap-10">
                    <AlertTriangle size={18} className="group-hover:text-red-500 transition-colors" />
                    <span className="text-[11px] uppercase tracking-wider font-bold">Alerts</span>
                </div>
                {openAlerts.length > 0 && (
                    <span className="bg-red-500 rounded-[6px] text-white text-[10px] px-2 py-0.5 font-bold shadow-sm">{openAlerts.length}</span>
                )}
            </button>
            <button onClick={() => setActiveView('tourists')} className={`w-full rounded-[6px] flex items-center gap-10 px-3 h-11 ${activeView === 'tourists' ? 'bg-[#000080] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200'} shrink-0 group`}>
                <Users size={18} className={activeView === 'tourists' ? 'text-white' : "group-hover:text-blue-500 transition-colors text-slate-600"} />
                <span className={`text-[11px] uppercase tracking-wider font-bold ${activeView === 'tourists' ? 'text-white' : ''}`}>Tourists</span>
            </button>
            <div className="py-2">
                <div className="h-[1px] bg-slate-100 w-full mb-1"></div>
            </div>
            <button onClick={() => setActiveView('add-tourist')} className={`w-full rounded-[6px] flex items-center gap-10 px-3 h-11 ${activeView === 'add-tourist' ? 'bg-[#000080] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200'} shrink-0 group`}>
                <UserPlus size={18} className={activeView === 'add-tourist' ? 'text-white' : "group-hover:text-emerald-500 transition-colors text-slate-600"} />
                <span className={`text-[11px] uppercase tracking-wider font-bold ${activeView === 'add-tourist' ? 'text-white' : ''}`}>Add Personnel</span>
            </button>
            <button onClick={() => setActiveView('settings')} className={`w-full rounded-[6px] flex items-center gap-10 px-3 h-11 ${activeView === 'settings' ? 'bg-[#000080] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200'} shrink-0 group`}>
                <Settings size={18} className={activeView === 'settings' ? 'text-white' : "group-hover:text-slate-900 transition-colors text-slate-600"} />
                <span className={`text-[11px] uppercase tracking-wider font-bold ${activeView === 'settings' ? 'text-white' : ''}`}>Settings</span>
            </button>
        </nav>
    </div>
    <div className="mt-auto p-5 border-t border-slate-100 bg-slate-50 shrink-0">
        <div className="flex items-center gap-10">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2 h-2 shrink-0 rounded-full bg-emerald-500"></span>
                    <p className="text-[11px] font-bold text-slate-900 truncate">System Admin</p>
                </div>
                <p className="text-[9px] text-slate-500 font-mono tracking-tighter truncate">Aegis Core</p>
            </div>
        </div>
    </div>
</aside>

{/* MAIN AREA */}
<main className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
    {/* Stat Cards Row */}
    <div className="grid grid-cols-4 gap-px bg-slate-200 border-b border-slate-200 shrink-0 z-10 relative">
        <div className="bg-white p-5 border-t-2 border-emerald-500 flex flex-col justify-center shadow-lg">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">Active Tourists</p>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono">{activeTouristsWithCoords.length}</span>
                <span className="text-[10px] text-emerald-600 font-bold truncate">LIVE</span>
            </div>
        </div>
        <div className="bg-white p-5 border-t-2 border-red-500 flex flex-col justify-center shadow-lg">
            <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Open Events</p>
                {openAlerts.length > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] shrink-0"></span>}
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-red-500 font-mono">{openAlerts.length}</span>
                <span className="text-[10px] text-slate-400 font-medium truncate">CRITICAL</span>
            </div>
        </div>
        <div className="bg-white p-5 border-t-2 border-amber-500 flex flex-col justify-center shadow-lg">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">Active Zones</p>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 font-mono">{data?.zones?.length || 0}</span>
                <span className="text-[10px] text-slate-400 font-medium truncate">MONITORED</span>
            </div>
        </div>
        <div className="bg-white p-5 border-t-2 border-slate-300 flex flex-col justify-center shadow-md">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 truncate">System Uplink</p>
            <div className="flex items-baseline gap-2">
                <span className={`text-xl font-black font-mono ${systemStatus === 'OK' ? 'text-emerald-600' : 'text-red-600'}`}>{systemStatus}</span>
            </div>
        </div>
    </div>

    {/* Main View Area */}
    <div className="flex-1 relative bg-slate-50 overflow-hidden flex flex-col">
        {activeView === 'map' && (
            <div className="flex-1 relative bg-[#1a1a2e] flex items-center justify-center">
                {locationParams.loaded ? (
                    <LiveMapDynamic 
                        center={locationParams.center} 
                        activeTourists={activeTouristsWithCoords} 
                        openAlerts={openAlerts} 
                        zones={data?.zones} 
                        onPanicDetected={() => fetchLiveFeed()}
                    />
                ) : (
                    <div className="animate-pulse text-slate-500 font-mono tracking-widest uppercase">Requesting Global Positioning...</div>
                )}
        
                {/* Legend */}
                <div className="absolute top-10 left-6 bg-slate-900/90 border border-slate-700 p-5 rounded-[8px] min-w-[180px] backdrop-blur-md shadow-xl z-30">
                    <h4 className="text-white font-bold tracking-wider text-[10px] mb-4 border-b border-slate-700 pb-2 uppercase">MAP LEGEND</h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-10">
                            <span className="w-3 h-3 shrink-0 rounded-full bg-emerald-500 border border-white"></span>
                            <span className="text-slate-300 text-[10px] font-medium uppercase tracking-wide">Active & Safe</span>
                        </div>
                        <div className="flex items-center gap-10">
                            <span className="w-3 h-3 shrink-0 rounded-full bg-red-500 border border-white animate-pulse"></span>
                            <span className="text-slate-300 text-[10px] font-medium uppercase tracking-wide">SOS Signal</span>
                        </div>
                        <div className="flex items-center gap-10">
                            <span className="w-3 h-3 shrink-0 rounded-full bg-amber-500 border border-white"></span>
                            <span className="text-slate-300 text-[10px] font-medium uppercase tracking-wide">Zone Breach</span>
                        </div>
                    </div>
                </div>
                
                {/* Privacy Floating Tag */}
                <div className="absolute bottom-6 left-6 bg-amber-50 border border-amber-200 px-5 py-3 rounded-[8px] flex items-center gap-12 shadow-[0_8px_30px_rgb(0,0,0,0.08)] pointer-events-none z-30 max-w-sm">
                    <Lock className="text-amber-600 shrink-0" size={24} />
                    <div className="min-w-0">
                        <p className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider mb-0.5 truncate">Privacy Engine Active</p>
                        <p className="text-[10px] text-amber-600/90 leading-tight">Full identities legally masked prior to case acceptance.</p>
                    </div>
                </div>
            </div>
        )}

        {activeView === 'tourists' && (
            <div className="flex-1 overflow-auto p-10 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-300 pb-4">
                        <div>
                            <h2 className="text-2xl font-black text-[#000080] tracking-tight">PERSONNEL DATA</h2>
                            <p className="text-sm font-mono text-slate-500 mt-1">SECURE DIRECTORY ENUMERATION</p>
                        </div>
                        <button onClick={() => router.push('/tourist')} className="px-8 h-11 bg-[#000080] text-white flex items-center justify-center rounded-[6px] text-[11px] font-bold uppercase tracking-wider shadow-sm hover:bg-black transition-colors">
                            Access Portal Override
                        </button>
                    </div>
                    
                    <div className="bg-white border border-slate-300 rounded-[0px] shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                    <th className="px-5 py-8 font-mono font-bold">Clearance ID</th>
                                    <th className="px-5 py-8">Status</th>
                                    <th className="px-5 py-8">Monitored Name</th>
                                    <th className="px-5 py-8 font-mono font-bold">Coordinates</th>
                                    <th className="px-5 py-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.tourists || []).map((t: Tourist) => {
                                    const hasSOS = data?.alerts?.some((a: Alert) => a.tourist_id === t.id && ['PANIC', 'SOS', 'FALL_DETECTED', 'FALL'].includes((a.type || '').toUpperCase()) && a.status === 'OPEN');
                                    let statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
                                    let statusText = 'ACTIVE';
                                    if (hasSOS) {
                                        statusColor = 'text-red-600 bg-red-50 border-red-200 animate-pulse';
                                        statusText = 'CRITICAL';
                                    } else if (!t.active) {
                                        statusColor = 'text-slate-500 bg-slate-100 border-slate-200';
                                        statusText = 'OFFLINE';
                                    }

                                    return (
                                        <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm">
                                            <td className="px-5 py-8 font-mono text-slate-500 text-[11px]">{t.aadhaar}</td>
                                            <td className="px-5 py-8">
                                                <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase border rounded-[2px] ${statusColor}`}>
                                                    {statusText}
                                                </span>
                                            </td>
                                            <td className="px-5 py-8 text-slate-900 font-bold text-sm tracking-tight">{t.name}</td>
                                            <td className="px-5 py-8 font-mono text-slate-500 text-[11px]">{t.latitude?.toFixed ? t.latitude.toFixed(4) : 'N/A'}, {t.longitude?.toFixed ? t.longitude.toFixed(4) : 'N/A'}</td>
                                            <td className="px-5 py-8 text-right">
                                                <button onClick={() => {setSelectedTouristId(t.id); setActiveView('tourist-detail');}} className="text-[10px] uppercase font-bold text-[#000080] hover:text-black hover:underline tracking-wider">Investigate</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {(!data?.tourists || data.tourists.length === 0) && (
                            <div className="p-10 text-center text-slate-500 font-mono text-sm uppercase tracking-widest">
                                No secure personnel data found in registry.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {activeView === 'add-tourist' && <AddTouristView onSuccess={() => {setActiveView('tourists'); fetchLiveFeed();}} />}
        {activeView === 'settings' && <SettingsView />}
        {activeView === 'tourist-detail' && selectedTouristId && (
            <TouristDetailView 
                tourist={data?.tourists?.find((t: Tourist) => t.id === selectedTouristId) as Tourist} 
                onBack={() => setActiveView('tourists')} 
            />
        )}
    </div>
</main>

{/* RIGHT PANEL - Unified Alert Feed & Devices */}
<aside className="w-[320px] shrink-0 bg-white border-l border-slate-200 flex flex-col h-full z-40 overflow-hidden">
    <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2 shrink-0">
        <button onClick={() => setRightPanelTab('alerts')} className={`rounded-[6px] h-11 flex-1 text-[11px] font-bold uppercase tracking-wider truncate px-2 transition-colors ${rightPanelTab === 'alerts' ? 'bg-[#000080] text-white shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-200'}`}>Alert Feed</button>
        <button onClick={() => setRightPanelTab('devices')} className={`rounded-[6px] h-11 flex-1 text-[11px] font-bold uppercase tracking-wider truncate px-2 transition-colors ${rightPanelTab === 'devices' ? 'bg-[#000080] text-white shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-200'}`}>Devices</button>
    </div>
    
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-12 space-y-4">
        {rightPanelTab === 'alerts' && (
            <>
                {openAlerts.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                         <ShieldCheck size={48} className="mb-4 opacity-30" />
                         <p className="text-sm font-bold uppercase tracking-wider text-slate-500">All Clear</p>
                         <p className="text-[11px] mt-1 text-slate-400">No active incidents</p>
                     </div>
                )}

                {openAlerts.map((alert: Alert) => {
                    const tourist = data?.tourists?.find((t: Tourist) => t.id === alert.tourist_id);
                    const isSOS = ['PANIC', 'SOS', 'FALL_DETECTED', 'FALL'].includes((alert.type || '').toUpperCase());
                    const colorClass = isSOS ? 'border-red-500 bg-red-50/30 text-red-600' : 'border-amber-500 bg-amber-50/30 text-amber-600';

                    return (
                        <div key={alert.id} className={`border rounded-[8px] p-5 border-l-4 ${colorClass.split(' ')[0]} bg-white shadow-sm flex flex-col`}>
                            <div className="flex justify-between items-start mb-3 gap-10">
                                <div className="flex items-center gap-2 min-w-0">
                                    {isSOS ? <ShieldAlert size={16} className="shrink-0" /> : <AlertTriangle size={16} className="shrink-0" />}
                                    <span className="font-bold text-[11px] uppercase tracking-wide truncate">{alert.type}</span>
                                </div>
                                <span className="font-mono text-[9px] text-slate-400 shrink-0 pt-0.5">{isIST(alert.created_at)} (IST)</span>
                            </div>
                            <p className="text-[13px] font-black text-slate-900 mb-1 truncate">{tourist?.name || 'UNKNOWN'}</p>
                            <p className="text-[10px] text-slate-500 font-mono mb-2 truncate">ID: {tourist?.aadhaar || 'MASKED'}</p>
                            {isSOS && (
                                <div className="bg-red-50 border border-red-100 rounded p-2 mb-3">
                                    <p className="text-[9px] font-bold text-red-600 uppercase mb-1">Incident Location</p>
                                    <p className="text-[11px] font-mono font-bold text-red-700">{alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}</p>
                                </div>
                            )}
                            <div className="flex gap-2 mt-auto">
                                <button onClick={() => handleResolveAlert(alert.id)} className="rounded-[6px] h-9 px-4 bg-slate-900 text-white min-w-0 flex-1 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-sm">
                                    RESOLVE
                                </button>
                            </div>
                        </div>
                    )
                })}
            </>
        )}

        {rightPanelTab === 'devices' && (
            <>
                {(!activeTouristsWithCoords || activeTouristsWithCoords.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Radio size={48} className="mb-4 opacity-30" />
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-500">No Signal</p>
                        <p className="text-[11px] mt-1 text-slate-400">0 devices transmitting</p>
                    </div>
                )}
                {activeTouristsWithCoords.map((tourist: Tourist) => (
                    <div key={tourist.id} className="bg-white border border-slate-200 rounded-[8px] p-12 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500"></div>
                        <div className="pl-2">
                             <div className="flex justify-between items-center mb-1">
                                <p className="text-[12px] font-extrabold text-[#000080] uppercase truncate">{tourist.name}</p>
                                <span className="flex h-2 w-2 relative shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                             </div>
                             <p className="font-mono text-[9px] text-slate-400 mb-3">{tourist.aadhaar}</p>
                             <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                                 <div>
                                    <p className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">Telemetry</p>
                                    <p className="font-mono text-[10px] text-slate-700">{tourist.latitude?.toFixed ? tourist.latitude.toFixed(4) : 'N/A'}, {tourist.longitude?.toFixed ? tourist.longitude.toFixed(4) : 'N/A'}</p>
                                 </div>
                                 <button onClick={() => locationParams.loaded && setLocationParams({ loaded: true, center: [tourist.latitude as number, tourist.longitude as number] })} className="text-[10px] font-bold text-[#000080] hover:underline uppercase tracking-wider">Locate</button>
                             </div>
                        </div>
                    </div>
                ))}
            </>
        )}
    </div>

</aside>

</div>
      </div>

      {/* SOS POPUP NOTIFICATION */}
      {showNotification && lastNotification && (
          <div className="fixed bottom-10 right-10 z-[100] w-96 animate-in slide-in-from-right duration-500">
              <div className="bg-red-600 text-white rounded-xl shadow-2xl overflow-hidden border-2 border-white/20 backdrop-blur-lg">
                  <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="bg-white/20 p-3 rounded-full animate-pulse">
                              <ShieldAlert size={28} className="text-white" />
                          </div>
                          <div>
                              <h3 className="text-xl font-black uppercase tracking-tighter">CRITICAL ALERT</h3>
                              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest font-mono">Emergency Signal Detected</p>
                          </div>
                      </div>
                      
                      <div className="bg-white/10 rounded-lg p-4 mb-6 border border-white/5">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Status</p>
                                  <p className="text-sm font-black">{lastNotification.type}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Time (IST)</p>
                                  <p className="text-sm font-mono font-bold">{isIST(lastNotification.created_at)}</p>
                              </div>
                          </div>

                          <div className="bg-white/20 rounded-lg p-3 mb-4 border border-white/10 animate-pulse">
                               <p className="text-[10px] uppercase font-bold opacity-80 mb-1">Actual Panic Coordinates</p>
                               <div className="flex items-center gap-2">
                                   <Radio size={14} className="text-white" />
                                   <p className="text-base font-mono font-black tracking-widest">{lastNotification.latitude.toFixed(6)}, {lastNotification.longitude.toFixed(6)}</p>
                               </div>
                          </div>

                          <div className="pt-2 border-t border-white/10">
                               <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Personnel Name</p>
                               <p className="text-sm font-black truncate">{data?.tourists?.find(t => t.id === lastNotification.tourist_id)?.name || 'Unknown Personnel'}</p>
                               <p className="text-[9px] font-mono opacity-50 mt-1 uppercase">ID: {lastNotification.tourist_id}</p>
                          </div>
                      </div>

                      <div className="flex gap-3">
                          <button 
                            onClick={() => {
                                handleResolveAlert(lastNotification.id);
                                setShowNotification(false);
                            }}
                            className="flex-1 bg-white text-red-600 font-black py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-lg"
                          >
                              ACKNOWLEDGE & RESOLVE
                          </button>
                          <button 
                            onClick={() => setShowNotification(false)}
                            className="px-4 bg-transparent border border-white/30 text-white font-bold rounded-lg text-xs hover:bg-white/10 transition-colors"
                          >
                              CLOSE
                          </button>
                      </div>
                  </div>
                  <div className="h-1 bg-white/30 w-full overflow-hidden">
                      <div className="h-full bg-white animate-[progress_10s_linear]" style={{ width: '100%' }}></div>
                  </div>
              </div>
          </div>
      )}
      
      <style>{`
          @keyframes progress {
              from { width: 100%; }
              to { width: 0%; }
          }
      `}</style>
    </>
  );
}
