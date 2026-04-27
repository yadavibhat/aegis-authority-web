'use client';
import React, { useState } from 'react';

export default function ZoneScreen() {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  // Simple interactive wrapper handler
  const handleAction = async (endpoint: string, method: string = 'GET') => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method });
      const result = await res.json();
      setData(result);
      console.log("Fetched Data", result);
      alert("Fetched Data! Total records: " + (Array.isArray(result) ? result.length : "N/A"));
    } catch {
      alert("Error communicating with server.");
    }
    setLoading(false);
  };

  return (
    <div className={loading ? "opacity-50 pointer-events-none" : ""}>
    <div onClick={(e) => {
      // Generic interceptor for untouched buttons
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' && !target.hasAttribute('data-action-wired')) {
         alert("Simulated Button Click Request. Route logic active.");
         handleAction('/api/admin/live'); // Force a fetch on generic buttons
      }
    }}>
   
{/* Top Navigation Anchor */}
<header className="bg-white dark:bg-slate-900 border-b border-[#e5e7eb] dark:border-slate-800 flex justify-between items-center h-12 px-8 w-full fixed top-0 z-50">
<div className="flex items-center gap-12">
<span className="text-lg font-bold text-[#000080] dark:text-blue-400 uppercase tracking-wider font-['Inter']">National Tourist Safety Grid</span>
<nav className="hidden md:flex gap-10 items-center h-full">
<a className="text-slate-600 dark:text-slate-400 font-['Inter'] font-semibold tracking-tight transition-colors duration-150 hover:bg-slate-50 py-5" href="/authority">Live Map</a>
<a className="text-slate-600 dark:text-slate-400 font-['Inter'] font-semibold tracking-tight transition-colors duration-150 hover:bg-slate-50 py-5" href="/alert">Alerts</a>
<a className="text-slate-600 dark:text-slate-400 font-['Inter'] font-semibold tracking-tight transition-colors duration-150 hover:bg-slate-50 py-5" href="/tourist">Tourists</a>
<a className="text-[#000080] border-b-2 border-[#000080] font-['Inter'] font-semibold tracking-tight transition-colors duration-150 py-5" href="/zone">Zones</a>
<a className="text-slate-600 dark:text-slate-400 font-['Inter'] font-semibold tracking-tight transition-colors duration-150 hover:bg-slate-50 py-5" href="/authority">Reports</a>
</nav>
</div>
<div className="flex items-center gap-12">
<span className="material-symbols-outlined text-slate-600 cursor-pointer">notifications</span>
<span className="material-symbols-outlined text-slate-600 cursor-pointer">account_circle</span>
</div>
</header>
{/* Side Navigation Anchor */}
<aside className="bg-white dark:bg-slate-900 border-r border-[#e5e7eb] dark:border-slate-800 flex flex-col h-full fixed left-0 top-0 pt-16 w-[320px] hidden lg:flex">
<div className="p-12 border-b border-[#e5e7eb]">
<h2 className="text-xl font-black text-[#000080] font-['Inter']">Safety Grid</h2>
<p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Zone Management</p>
</div>
<nav className="flex-1 px-4 py-8 flex flex-col gap-2">
<button className="rounded-[6px] h-12 flex items-center gap-10 px-4 py-3 text-slate-700 dark:text-slate-300 font-medium transition-all duration-200 hover:bg-slate-100">
<span className="material-symbols-outlined">map</span> Live Map
      </button>
<button className="rounded-[6px] h-12 flex items-center gap-10 px-4 py-3 text-slate-700 dark:text-slate-300 font-medium transition-all duration-200 hover:bg-slate-100">
<span className="material-symbols-outlined">warning</span> Alerts
      </button>
<button className="rounded-[6px] h-12 flex items-center gap-10 px-4 py-3 text-slate-700 dark:text-slate-300 font-medium transition-all duration-200 hover:bg-slate-100">
<span className="material-symbols-outlined">group</span> Tourists
      </button>
<button className="rounded-[6px] h-12 flex items-center gap-10 px-4 py-3 bg-[#000080] text-white font-medium transition-all duration-200">
<span className="material-symbols-outlined">layers</span> Zones
      </button>
<button className="rounded-[6px] h-12 flex items-center gap-10 px-4 py-3 text-slate-700 dark:text-slate-300 font-medium transition-all duration-200 hover:bg-slate-100">
<span className="material-symbols-outlined">assessment</span> Reports
      </button>
</nav>
</aside>
<main className="lg:pl-64 pt-16 h-screen flex flex-col">
<div className="flex flex-1 overflow-hidden">
{/* Left Panel: Zone List */}
<section className="w-[420px] bg-white border-r border-[#e5e7eb] flex flex-col overflow-hidden">
<div className="p-12 border-b border-[#e5e7eb] space-y-6">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
<input className="rounded-[6px] h-12 w-full pl-10 pr-4 py-2 border border-[#111827] focus:outline-none focus:ring-0 text-base placeholder:text-slate-400 " placeholder="Search zones…" type="text"/>
</div>
<div className="flex flex-wrap gap-2">
<button className="rounded-[6px] h-12 px-3 py-1 bg-[#000080] text-white text-xs border border-[#000080]">All</button>
<button className="rounded-[6px] h-12 px-3 py-1 bg-white text-slate-700 text-xs border border-[#e5e7eb] hover:bg-slate-50">Safe</button>
<button className="rounded-[6px] h-12 px-3 py-1 bg-white text-slate-700 text-xs border border-[#e5e7eb] hover:bg-slate-50">Unsafe</button>
<button className="rounded-[6px] h-12 px-3 py-1 bg-white text-slate-700 text-xs border border-[#e5e7eb] hover:bg-slate-50">Active</button>
<button className="rounded-[6px] h-12 px-3 py-1 bg-white text-slate-700 text-xs border border-[#e5e7eb] hover:bg-slate-50">Inactive</button>
</div>
</div>
<div className="flex-1 overflow-y-auto bg-slate-50">
{/* Zone Cards */}
<div className="p-12 border-b border-[#e5e7eb] bg-white flex h-12 group cursor-pointer transition-colors hover:bg-slate-50">
<div className="w-1.5 bg-[#22c55e]"></div>
<div className="flex-1 p-12 flex flex-col justify-between">
<div className="flex justify-between items-start">
<div>
<h4 className="font-bold text-sm">Central Heritage Plaza</h4>
<p className="text-xs text-slate-500 truncate">High tourist density, safe walking zone.</p>
</div>
<span className="text-[10px] border border-[#22c55e] text-[#22c55e] px-1.5 py-0.5">SAFE</span>
</div>
<div className="flex items-center justify-between mt-2">
<div className="flex gap-10 text-[10px] font-mono text-slate-600">
<span>R: 500m</span>
<span>28.61, 77.23</span>
</div>
<div className="flex gap-10">
<button className="rounded-[6px] h-12 text-[11px] text-slate-500 hover:text-[#000080] font-medium">Edit</button>
<button className="rounded-[6px] h-12 text-[11px] text-slate-500 hover:text-[#ba1a1a] font-medium">Deactivate</button>
</div>
</div>
</div>
</div>
<div className="p-12 border-b border-[#e5e7eb] bg-white flex h-12 group cursor-pointer transition-colors hover:bg-slate-50">
<div className="w-1.5 bg-[#ba1a1a]"></div>
<div className="flex-1 p-12 flex flex-col justify-between">
<div className="flex justify-between items-start">
<div>
<h4 className="font-bold text-sm">East Industrial Ridge</h4>
<p className="text-xs text-slate-500 truncate">Unauthorized heavy vehicle movement.</p>
</div>
<span className="text-[10px] border border-[#ba1a1a] text-[#ba1a1a] px-1.5 py-0.5">UNSAFE</span>
</div>
<div className="flex items-center justify-between mt-2">
<div className="flex gap-10 text-[10px] font-mono text-slate-600">
<span>R: 1200m</span>
<span>28.65, 77.31</span>
</div>
<div className="flex gap-10">
<button className="rounded-[6px] h-12 text-[11px] text-slate-500 hover:text-[#000080] font-medium">Edit</button>
<button className="rounded-[6px] h-12 text-[11px] text-slate-500 hover:text-[#ba1a1a] font-medium">Deactivate</button>
</div>
</div>
</div>
</div>
<div className="p-12 border-b border-[#e5e7eb] bg-white flex h-12 group cursor-pointer transition-colors hover:bg-slate-50">
<div className="w-1.5 bg-[#22c55e]"></div>
<div className="flex-1 p-12 flex flex-col justify-between">
<div className="flex justify-between items-start">
<div>
<h4 className="font-bold text-sm">Lakeside Promnade</h4>
<p className="text-xs text-slate-500 truncate">Approved recreational waterfront area.</p>
</div>
<span className="text-[10px] border border-[#22c55e] text-[#22c55e] px-1.5 py-0.5">SAFE</span>
</div>
<div className="flex items-center justify-between mt-2">
<div className="flex gap-10 text-[10px] font-mono text-slate-600">
<span>R: 350m</span>
<span>28.58, 77.25</span>
</div>
<div className="flex gap-10">
<button className="rounded-[6px] h-12 text-[11px] text-slate-500 hover:text-[#000080] font-medium">Edit</button>
<button className="rounded-[6px] h-12 text-[11px] text-slate-500 hover:text-[#ba1a1a] font-medium">Deactivate</button>
</div>
</div>
</div>
</div>
</div>
<div className="p-12 bg-white border-t border-[#e5e7eb]">
<button className="rounded-[6px] h-12 w-full bg-[#000080] text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#00006e] transition-colors">
            Add new zone <span className="material-symbols-outlined text-sm">add</span>
</button>
</div>
</section>
{/* Right Panel: Map & Form */}
<section className="flex-1 flex flex-col bg-slate-50">
{/* Map Area */}
<div className="relative flex-1 bg-[#1a1a1a] overflow-hidden">
{/* eslint-disable-next-line @next/next/no-img-element */}
<img alt="Zone Visualization" className="w-full h-full object-cover grayscale opacity-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbffRImwiQOtETAyESqV1sIZ8l4-JnF7L38NbB3pwt783rvFDR2ix-Ot_7PPKr1day8YHrTLSE5fkLpiZcn9NKzt4EK3pGS-ZPU4q94nIZqsYpvm1btTw0S5xIJF-E2hmSoycRbty13vM9EpI1KFxz_I2ZvpaNLHjfDGplQ4ToC3bZw4pd8lByl3EJYW29RjCnlBEqilctyqrieMX12wD4VCxZ3pMlBiCy5XbMnpwsfSTckAF8YD0gHkCZfz-8feLvdsSyrnwBmi3q"/>
{/* SVG Overlays for Zones */}
<div className="absolute inset-0 pointer-events-none">
<div className="absolute top-1/3 left-1/4 w-32 h-12 border-2 border-green-500 bg-green-500/30 rounded-full flex items-center justify-center">
<span className="font-mono text-[10px] text-green-400">ZONE_01</span>
</div>
<div className="absolute bottom-1/4 right-1/3 w-48 h-12 border-2 border-red-500 bg-red-500/30 rounded-full flex items-center justify-center">
<span className="font-mono text-[10px] text-red-400">ZONE_02</span>
</div>
</div>
{/* Map Overlay UI */}
<div className="absolute top-10 right-6 flex flex-col gap-2">
<button className="rounded-[6px] w-10 h-12 bg-white border border-[#111827] flex items-center justify-center hover:bg-slate-50">
<span className="material-symbols-outlined">add</span>
</button>
<button className="rounded-[6px] w-10 h-12 bg-white border border-[#111827] flex items-center justify-center hover:bg-slate-50">
<span className="material-symbols-outlined">remove</span>
</button>
<button className="rounded-[6px] w-10 h-12 bg-white border border-[#111827] flex items-center justify-center hover:bg-slate-50">
<span className="material-symbols-outlined">my_location</span>
</button>
</div>
</div>
{/* Zone Creation Form */}
<div className="bg-white border-t border-[#e5e7eb] p-12">
<h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-10 flex items-center gap-2">
<span className="material-symbols-outlined text-sm">edit_square</span> Zone Configuration
          </h3>
<div className="grid grid-cols-4 gap-10">
<div className="space-y-6">
<label className="rounded-[6px] h-12 block text-[11px] font-medium text-sm-400 uppercase">Zone Name</label>
<input className="rounded-[6px] h-12 w-full border border-[#111827] px-3 py-2 text-base " type="text" value="New Sector Alpha"/>
</div>
<div className="space-y-6">
<label className="rounded-[6px] h-12 block text-[11px] font-medium text-sm-400 uppercase">Type</label>
<select className="rounded-[6px] h-12 w-full border border-[#111827] px-3 py-2 text-base bg-white">
<option>Safe</option>
<option>Unsafe</option>
</select>
</div>
<div className="space-y-6">
<label className="rounded-[6px] h-12 block text-[11px] font-medium text-sm-400 uppercase">Center Coordinates</label>
<input className="rounded-[6px] h-12 w-full border border-[#111827] px-3 py-2 text-base font-mono " type="text" value="28.6139° N, 77.2090° E"/>
</div>
<div className="space-y-6">
<label className="rounded-[6px] h-12 block text-[11px] font-medium text-sm-400 uppercase">Radius (m)</label>
<input className="rounded-[6px] h-12 w-full border border-[#111827] px-3 py-2 text-base font-mono " type="text" value="750"/>
</div>
</div>
<div className="flex justify-end gap-10 mt-6">
<button className="rounded-[6px] h-12 px-8 py-2 border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50">Cancel</button>
<button className="rounded-[6px] h-12 px-8 py-2 bg-[#000080] text-white text-sm font-semibold hover:bg-[#00006e]">Create Zone</button>
</div>
</div>
</section>
</div>
{/* Bottom Panel: Breach History */}
<section className="h-12 bg-white border-t border-[#e5e7eb] flex flex-col overflow-hidden">
<div className="px-8 py-3 border-b border-[#e5e7eb] flex justify-between items-center bg-slate-50">
<h3 className="text-sm font-bold flex items-center gap-2">
<span className="material-symbols-outlined text-red-600 text-sm">history</span> Zone Breach History
        </h3>
<span className="text-[10px] text-slate-500 font-mono">LIVE FEED ACTIVE</span>
</div>
<div className="flex-1 overflow-y-auto">
<table className="w-full text-left border-collapse">
<thead className="sticky top-0 bg-[#f9fafb] border-b border-[#e5e7eb]">
<tr>
<th className="px-8 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tourist Name</th>
<th className="px-8 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Zone Entered</th>
<th className="px-8 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entry Time</th>
<th className="px-8 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Duration</th>
<th className="px-8 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alert Triggered</th>
</tr>
</thead>
<tbody className="divide-y divide-[#e5e7eb]">
<tr className="hover:bg-slate-50 transition-colors">
<td className="px-8 py-3 text-sm font-medium">Ravi K. ████</td>
<td className="px-8 py-3 text-sm text-[#ba1a1a]">East Industrial Ridge</td>
<td className="px-8 py-3 text-sm font-mono">14:22:05</td>
<td className="px-8 py-3 text-sm">12m 30s</td>
<td className="px-8 py-3">
<span className="px-2 py-0.5 border border-[#ba1a1a] text-[#ba1a1a] text-[10px] font-bold">YES</span>
</td>
</tr>
<tr className="hover:bg-slate-50 transition-colors">
<td className="px-8 py-3 text-sm font-medium">Elena M. ████</td>
<td className="px-8 py-3 text-sm text-[#ba1a1a]">East Industrial Ridge</td>
<td className="px-8 py-3 text-sm font-mono">14:05:12</td>
<td className="px-8 py-3 text-sm">05m 12s</td>
<td className="px-8 py-3">
<span className="px-2 py-0.5 border border-[#ba1a1a] text-[#ba1a1a] text-[10px] font-bold">YES</span>
</td>
</tr>
<tr className="hover:bg-slate-50 transition-colors">
<td className="px-8 py-3 text-sm font-medium">Chen L. ████</td>
<td className="px-8 py-3 text-sm text-slate-600">Restricted Govt. Grid</td>
<td className="px-8 py-3 text-sm font-mono">13:58:44</td>
<td className="px-8 py-3 text-sm">01m 45s</td>
<td className="px-8 py-3">
<span className="px-2 py-0.5 border border-[#000080] text-[#000080] text-[10px] font-bold">NO</span>
</td>
</tr>
<tr className="hover:bg-slate-50 transition-colors">
<td className="px-8 py-3 text-sm font-medium">Mark O. ████</td>
<td className="px-8 py-3 text-sm text-[#ba1a1a]">East Industrial Ridge</td>
<td className="px-8 py-3 text-sm font-mono">13:40:20</td>
<td className="px-8 py-3 text-sm">45m 10s</td>
<td className="px-8 py-3">
<span className="px-2 py-0.5 border border-[#ba1a1a] text-[#ba1a1a] text-[10px] font-bold">YES</span>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</main>

   </div>
  </div>
 );
}
