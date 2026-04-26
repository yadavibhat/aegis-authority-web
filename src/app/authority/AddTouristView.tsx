import React, { useState } from 'react';
import { UserPlus, Save, AlertCircle } from 'lucide-react';

export default function AddTouristView({ onSuccess }: { onSuccess: () => void }) {
    const [formData, setFormData] = useState({ name: '', aadhaar: '', phone: '', active: true, lat: 28.6139, lng: 77.2090 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/tourists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to add personnel');
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-auto p-10 bg-slate-50">
            <div className="max-w-2xl mx-auto">
                <div className="mb-10 border-b border-slate-300 pb-4 text-[#000080]">
                    <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-3">
                        <UserPlus size={24} /> Register New Personnel
                    </h2>
                    <p className="text-sm font-mono text-slate-500 mt-1">SECURE IDENTITY ENROLLMENT</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded-[8px] p-8 shadow-sm space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 text-sm flex items-center gap-2 font-medium">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                            <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition-all" placeholder="E.g. S. RATHORE" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">UID / Passport</label>
                                <input required type="text" value={formData.aadhaar} onChange={(e) => setFormData({...formData, aadhaar: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition-all font-mono" placeholder="XXXX-XXXX-XXXX" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Emergency Contact</label>
                                <input required type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition-all font-mono" placeholder="+91 9999999999" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Initial Latitude</label>
                                <input required type="number" step="any" value={formData.lat} onChange={(e) => setFormData({...formData, lat: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition-all font-mono" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Initial Longitude</label>
                                <input required type="number" step="any" value={formData.lng} onChange={(e) => setFormData({...formData, lng: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition-all font-mono" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button disabled={loading} type="submit" className="h-11 px-8 bg-[#000080] text-white font-bold text-[11px] uppercase tracking-wider rounded-[6px] shadow-md flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-50">
                            <Save size={16} /> {loading ? 'Enrolling...' : 'Enroll & Authenticate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
