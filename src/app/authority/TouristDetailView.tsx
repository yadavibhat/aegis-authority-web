import React, { useEffect, useState } from 'react';
import { User, Activity, AlertTriangle, Fingerprint, Calendar, ArrowLeft, Watch } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function TouristDetailView({ tourist, alerts, onBack }: { tourist: any, alerts: any[], onBack: () => void }) {
    const [history, setHistory] = useState<any[]>([]);
    
    // In a real production system, you'd fetch the exact `locations` or historical alert logs.
    // For now we'll filter the global live alerts to show their specific events.
    const touristAlerts = alerts.filter(a => a.tourist_id === tourist.id);

    return (
        <div className="flex-1 overflow-auto p-10 bg-slate-50 relative">
            <button onClick={onBack} className="absolute top-10 right-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 px-4 py-2 rounded-md shadow-sm">
                <ArrowLeft size={14} /> Back to Directory
            </button>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-6 mb-10 border-b border-slate-300 pb-4 text-[#000080]">
                    <div className="w-16 h-16 rounded-[4px] bg-[#000080] text-white flex items-center justify-center flex-shrink-0">
                        <User size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight uppercase">{tourist.name}</h2>
                        <p className="text-xs font-mono font-bold text-slate-500 mt-1 uppercase tracking-widest">
                            AADHAAR REF: {tourist.aadhaar || 'UNAVAILABLE'} | DB-ID: {tourist.id.substring(0,8)}...
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Device Block */}
                    <div className="bg-white border text-center border-slate-200 p-8 shadow-sm rounded-xl">
                        <Watch className="text-emerald-500 mx-auto mb-4" size={32} />
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Hardware Module</h3>
                        <p className="text-lg font-mono font-black text-slate-800">{tourist.device_id || 'NOT LINKED'}</p>
                    </div>
                    
                    {/* Status Block */}
                    <div className={`border text-center p-8 shadow-sm rounded-xl ${touristAlerts.some(a => a.status === 'OPEN') ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                        <Activity className={touristAlerts.some(a => a.status === 'OPEN') ? 'text-red-500 mx-auto mb-4 animate-pulse' : 'text-emerald-500 mx-auto mb-4'} size={32} />
                        <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${touristAlerts.some(a => a.status === 'OPEN') ? 'text-red-400' : 'text-emerald-600/70'}`}>Live Assessment</h3>
                        <p className={`text-lg font-black tracking-wider uppercase ${touristAlerts.some(a => a.status === 'OPEN') ? 'text-red-600' : 'text-emerald-700'}`}>
                            {touristAlerts.some(a => a.status === 'OPEN') ? 'CRITICAL EMERGENCY' : 'STABLE'}
                        </p>
                    </div>
                </div>

                {/* Secure Event Log */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <AlertTriangle className="text-slate-400" size={16} />
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Incident Record</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {touristAlerts.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 font-mono text-[11px] uppercase tracking-widest">
                                No historical incidents linked to this profile.
                            </div>
                        ) : (
                            touristAlerts.map(alert => (
                                <div key={alert.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border ${alert.type.includes('SOS') || alert.type.includes('panic') ? 'bg-red-50 border-red-200 text-red-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
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
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
