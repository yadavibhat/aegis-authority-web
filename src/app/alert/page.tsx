'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AlertScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Simple interactive wrapper handler
  const handleAction = async (endpoint: string, method: string = 'GET') => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method });
      const result = await res.json();
      setData(result);
      alert("Fetched Data! Total records: " + (Array.isArray(result) ? result.length : "N/A"));
    } catch (e) {
      alert("Error communicating with server.");
    }
    setLoading(false);
  };

 return (
  <>
   <div onClick={(e) => {
     // Generic interceptor for untouched buttons
     const target = e.target as HTMLElement;
     if (target.tagName === 'BUTTON' && !target.hasAttribute('data-action-wired')) {
        alert("Simulated Button Click Request. Route logic active.");
        handleAction('/api/admin/live'); // Force a fetch on generic buttons
     }
   }}>
   
{/* Global Navigation Shell (TopAppBar) */}
<header className="bg-white dark:bg-slate-950 border-b border-[#e5e7eb] dark:border-slate-800 sticky top-0 z-50">
<div className="flex justify-between items-center h-12 px-8 w-full max-w-[1280px] mx-auto">
<div className="text-lg font-black tracking-tighter text-[#000080] dark:text-white">SECURE PORTAL MONITOR</div>
<nav className="hidden md:flex gap-12 items-center h-full">
<a className="h-full flex items-center border-b-2 border-[#000080] text-[#000080] dark:text-blue-400 font-bold font-sans uppercase tracking-tight text-xs" href="/authority">Dashboard</a>
<a className="h-full flex items-center text-slate-500 dark:text-slate-400 font-medium font-sans uppercase tracking-tight text-xs hover:bg-slate-50" href="/authority">Alert Log</a>
<a className="h-full flex items-center text-slate-500 dark:text-slate-400 font-medium font-sans uppercase tracking-tight text-xs hover:bg-slate-50" href="/authority">Analytics</a>
<a className="h-full flex items-center text-slate-500 dark:text-slate-400 font-medium font-sans uppercase tracking-tight text-xs hover:bg-slate-50" href="/authority">Protocols</a>
</nav>
<div className="flex items-center gap-12">
<button className="h-12 bg-[#CC0000] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-[6px]">Emergency Alert</button>
<div className="flex gap-2">
<span className="material-symbols-outlined text-slate-600 cursor-pointer" data-icon="notifications">notifications</span>
<span className="material-symbols-outlined text-slate-600 cursor-pointer" data-icon="account_circle">account_circle</span>
</div>
</div>
</div>
</header>
<main className="relative flex h-[calc(100vh-56px)]">
{/* Dashboard Background Content (Muted) */}
<div className="flex-1 p-12 grid grid-cols-12 gap-10 opacity-40 pointer-events-none overflow-hidden">
<div className="col-span-12 h-12 bg-white border border-outline-variant"></div>
<div className="col-span-4 h-12 bg-white border border-outline-variant"></div>
<div className="col-span-8 h-12 bg-white border border-outline-variant"></div>
<div className="col-span-12 h-12 bg-white border border-outline-variant"></div>
</div>
{/* Right Side Alert Panel (600px) */}
<div className="fixed right-0 top-0 bottom-0 w-[600px] bg-white shadow-2xl z-50 border-l border-outline flex flex-col overflow-hidden">
{/* HEADER */}
<div className="border-t-4 border-error px-8 pt-8 pb-6 bg-white border-b border-outline-variant">
<div className="flex justify-between items-start mb-4">
<div className="bg-error text-white px-3 py-1 text-[11px] font-black tracking-widest uppercase rounded-none">PANIC / SOS</div>
<button className="rounded-[6px] h-12 text-on-surface-variant hover:bg-slate-100 p-12">
<span className="material-symbols-outlined" data-icon="close">close</span>
</button>
</div>
<h1 className="text-h2 font-sans font-bold text-primary mb-1">Ravi K. [Case not accepted]</h1>
<div className="font-mono text-[13px] text-on-surface-variant tracking-tighter">09:42:17 IST · 25 APR 2026</div>
<div className="flex gap-10 mt-6">
<button className="h-12 flex-1 bg-primary text-white py-3 text-xs font-bold uppercase tracking-widest rounded-[6px] hover:bg-opacity-90">Accept Case</button><button data-action-wired onClick={() => handleAction("/api/admin/alerts/1/resolve", "POST")}> &amp; Reveal Details</button>
<button className="h-12 flex-1 border border-primary text-primary py-3 text-xs font-bold uppercase tracking-widest rounded-[6px] hover:bg-slate-50">Escalate to Senior</button>
</div>
</div>
{/* BODY */}
<div className="flex-1 overflow-y-auto">
{/* Section 1: Location */}
<section className="px-8 py-8 border-b border-outline-variant">
<div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
<span className="material-symbols-outlined text-[16px]" data-icon="location_on">location_on</span>
            Live Incident Location
          </div>
<div className="relative w-full h-12 border border-outline mb-3 overflow-hidden">
<img className="w-full h-full object-cover grayscale contrast-125" data-alt="Top-down satellite view of an urban park area with detailed pathways, green foliage, and surrounding city buildings in high contrast" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA2HZ1NX9Ig-RyTbHIagbIQpmD4TN7SpOynNSoBvcAuJlAsHbDWNc9ZaqzOeu8yGG3VFx3thHcnZ5Mr0fACyEljw3AF6WsAFkO2NnenAWNqjueComhLTEbLoUU-ACwG-0inLotMk_2gjygT7HK7jp51C6AmYRL07RkhMYTlAo9kWGZAWze-k-T4YN5omuv_deYXenXC6mbSuRpP2YugzaV-iuk5Et2SXIL71X7A8iLaUhfoOFHNoV5Eqqb7DtNPXp82Eejm9B8y03a"/>
<div className="absolute inset-0 bg-primary/5"></div>
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
<div className="w-4 h-12 bg-error rounded-full pulse-red"></div>
</div>
<div className="absolute bottom-2 right-2 bg-white/90 border border-outline px-2 py-1 font-mono text-[10px] uppercase">
              Accuracy: 3m
            </div>
</div>
<div className="flex justify-between items-center">
<div>
<div className="font-mono text-sm font-bold text-on-surface tracking-tight">12.9716° N, 77.5946° E</div>
<div className="text-[12px] text-on-surface-variant mt-1">47 seconds ago · via wearable AEGIS-007</div>
</div>
<button className="rounded-[6px] h-12 border border-outline px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-100 flex items-center gap-2">
              Open in Maps <span className="material-symbols-outlined text-[14px]" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</section>
{/* Section 2: Tourist Info (Masked) */}
<section className="px-8 py-8 border-b border-outline-variant bg-slate-50">
<div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
<span className="material-symbols-outlined text-[16px]" data-icon="person">person</span>
            Tourist Profile
          </div>
<div className="flex gap-10 items-start">
<div className="relative w-16 h-12 border border-outline">
<img className="w-full h-full object-cover blur-md grayscale" data-alt="Muted professional portrait of a man, heavily blurred and desaturated for data privacy mask" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh4b_zGt-T2P6_xWD8rLkokXhG5Hgw9F90tFJ7gbHBq-F-NhQoHN5S34Wo1Ko1P1TIXb-ZSiGD80kDOis6CTbDbUF4R_mlJ8YJnazS5rRzgP_LgyFO7IU44dNJKSJ3lobV45ecSFPz_mJYc6AefX4ihZzriZOkprMjTanrcu6CAb3XlfCwWnPW-qQLhufc6MvtFBs50Vzn4cJ1A9KDCQdfEMZQ73c73gJz2GvpQ2YG3MyEk8Tigt_KakxN78uH2jbyyJKQwwOUxgwm"/>
</div>
<div className="flex-1">
<div className="text-lg font-bold text-on-surface mb-1">Ravi K. ████████</div>
<div className="italic text-[13px] text-slate-400 mb-4 tracking-wide">— Accept case to reveal identity &amp; documents —</div>
<div className="grid grid-cols-2 gap-y-3">
<div>
<div className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Device Node</div>
<div className="font-mono text-[11px]">AEGIS-DEVICE-007</div>
</div>
<div>
<div className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Telemetry</div>
<div className="flex items-center gap-2 font-mono text-[11px]">
<span className="material-symbols-outlined text-[14px] text-error" data-icon="battery_horiz_035">battery_horiz_075</span> 34%
                    <span className="material-symbols-outlined text-[14px] text-primary" data-icon="settings_input_antenna">settings_input_antenna</span> LoRa
                  </div>
</div>
</div>
</div>
</div>
</section>
{/* Section 3: Alert Timeline */}
<section className="px-8 py-8 border-b border-outline-variant">
<div className="flex items-center gap-2 mb-10 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
<span className="material-symbols-outlined text-[16px]" data-icon="history">history</span>
            Incident Log Timeline
          </div>
<div className="relative border-l border-outline-variant ml-2 pl-6 space-y-6">
<div className="relative">
<div className="absolute -left-[30px] top-1 w-2 h-12 bg-error outline outline-4 outline-white"></div>
<div className="flex justify-between items-start">
<div className="text-[13px] font-semibold text-on-surface">Fall sensor triggered</div>
<div className="font-mono text-[11px] text-on-surface-variant bg-slate-100 px-2">09:42:01</div>
</div>
<div className="text-[11px] text-on-surface-variant mt-1 italic">High-velocity impact detected by accelerometer.</div>
</div>
<div className="relative">
<div className="absolute -left-[30px] top-1 w-2 h-12 bg-error outline outline-4 outline-white"></div>
<div className="flex justify-between items-start">
<div className="text-[13px] font-semibold text-on-surface">Panic button pressed</div>
<div className="font-mono text-[11px] text-on-surface-variant bg-slate-100 px-2">09:41:22</div>
</div>
<div className="text-[11px] text-on-surface-variant mt-1 italic">Manual override activation by user.</div>
</div>
<div className="relative">
<div className="absolute -left-[30px] top-1 w-2 h-12 bg-[#ffbf00] outline outline-4 outline-white"></div>
<div className="flex justify-between items-start">
<div className="text-[13px] font-semibold text-on-surface">Entered restricted zone B</div>
<div className="font-mono text-[11px] text-on-surface-variant bg-slate-100 px-2">09:40:15</div>
</div>
<div className="text-[11px] text-on-surface-variant mt-1 italic">Geofence breach detected at Perimeter 4.</div>
</div>
</div>
</section>
{/* Section 4: Response Actions */}
<section className="px-8 py-8 bg-slate-50">
<div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
<span className="material-symbols-outlined text-[16px]" data-icon="quick_reference_all">quick_reference_all</span>
            Mandatory Procedures
          </div>
<div className="grid grid-cols-2 gap-10 mb-3">
<button className="rounded-[6px] h-12 border border-primary text-primary py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100">Generate eFIR Report</button>
<button className="rounded-[6px] h-12 border border-primary text-primary py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100">Notify Emergency Contacts</button>
</div>
<button className="rounded-[6px] h-12 w-full bg-[#1b5e20] text-white py-8 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-opacity-90">Mark Case Resolved</button>
</section>
</div>
{/* FOOTER */}
<footer className="px-8 py-8 border-t border-outline-variant bg-white">
<div className="flex items-start gap-10">
<span className="material-symbols-outlined text-on-surface-variant text-[18px]" data-icon="gavel">gavel</span>
<p className="text-[10px] text-on-surface-variant uppercase leading-relaxed tracking-wider font-medium">
            All actions are logged with officer badge ID and timestamp per Section 43A IT Act. Unauthorized access to decrypted data is a punishable offense under state surveillance protocols.
          </p>
</div>
</footer>
</div>
</main>
{/* Site Footer (Underlay) */}
<footer className="fixed bottom-0 left-0 right-0 bg-slate-50 dark:bg-slate-950 border-t border-[#e5e7eb] dark:border-slate-800 z-40">
<div className="flex justify-between items-center py-8 px-8 w-full max-w-[1280px] mx-auto">
<div className="font-sans text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">OFFICIAL GOVERNMENT SYSTEM - AUTHORIZED ACCESS ONLY</div>
<div className="flex gap-10">
<a className="font-sans text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900" href="/authority">Compliance</a>
<a className="font-sans text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900" href="/authority">Audit Logs</a>
<a className="font-sans text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900" href="/authority">Help Desk</a>
</div>
</div>
</footer>

   </div>
  </>
 );
}
