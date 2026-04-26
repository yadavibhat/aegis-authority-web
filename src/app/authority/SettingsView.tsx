import React, { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Radio } from 'lucide-react';

export default function SettingsView() {
    const [useSimulation, setUseSimulation] = useState(false);
    const [hapticFallback, setHapticFallback] = useState(true);

    useEffect(() => {
        setUseSimulation(localStorage.getItem('aegis_sim') === 'true');
        setHapticFallback(localStorage.getItem('aegis_haptic') !== 'false');
    }, []);

    const toggleSim = () => {
        const next = !useSimulation;
        setUseSimulation(next);
        localStorage.setItem('aegis_sim', String(next));
    };

    const toggleHaptic = () => {
        const next = !hapticFallback;
        setHapticFallback(next);
        localStorage.setItem('aegis_haptic', String(next));
    };

    const triggerSweep = async () => {
        alert("CRITICAL SWEEP SIGNAL SENT (Simulation Mode)");
    };

    return (
        <div className="flex-1 overflow-auto p-10 bg-slate-50">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 border-b border-slate-300 pb-4 text-[#000080]">
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Settings size={28} /> SYSTEM CONFIGURATION
                    </h2>
                    <p className="text-sm font-mono text-slate-500 mt-1">AEGIS CORE CONTROLS - RESTRICTED ACCESS</p>
                </div>

                <div className="space-y-8">
                    {/* Control Block 1 */}
                    <div className="bg-white border border-slate-300 p-12 shadow-sm rounded-xl">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-2">
                            <Radio size={16} className="text-[#000080]" /> 
                            Geographic Hardware Modules
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 mb-1">Global Simulation Sandbox</p>
                                    <p className="text-[11px] text-slate-500">Forces map to inject test data locally rather than strictly using Supabase.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={useSimulation} onChange={toggleSim} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#000080]"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 mb-1">Wearable SOS Fallback (Haptic)</p>
                                    <p className="text-[11px] text-slate-500">Enable physical vibration fallback when cellular data connectivity drops.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={hapticFallback} onChange={toggleHaptic} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#000080]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Control Block 2 */}
                    <div className="bg-[#cc0000]/5 border border-[#cc0000]/20 p-12 shadow-sm rounded-xl">
                         <h3 className="text-sm font-bold text-[#cc0000] uppercase tracking-widest mb-10 flex items-center gap-2">
                            <ShieldAlert size={16} /> 
                            Emergency Protocols
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-900 mb-1">Evacuation Authority State</p>
                                <p className="text-[11px] text-slate-500">Instantly triggers alert on ALL connected tourist wearables.</p>
                            </div>
                            <button onClick={triggerSweep} className="h-10 px-8 bg-white border border-[#cc0000] text-[#cc0000] font-bold text-[11px] uppercase tracking-wider rounded-[6px] shadow-sm hover:bg-[#cc0000] hover:text-white transition-colors">
                                Initiate Sweep
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
