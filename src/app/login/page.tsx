'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginScreen() {
   const router = useRouter();
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [errorMsg, setErrorMsg] = useState('');

   const handleLogin = async (e: React.FormEvent) => {
       e.preventDefault();
       setLoading(true);
       setErrorMsg('');
       
       try {
           const res = await fetch('/api/auth/login', { 
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ username, password })
           });
           const result = await res.json();
           
           if (res.ok) {
               // Store token or handle success mapping
               console.log("Logged in:", result.user);
               router.push('/authority');
           } else {
               setErrorMsg(result.error || "Authentication failed. Please verify credentials.");
           }
       } catch (error) {
           setErrorMsg("Network error connecting to the authentication server.");
       }
       setLoading(false);
   };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] relative overflow-hidden">
      {/* Background Decorator Lines for Premium Depth */}
      <div className="absolute top-0 w-full h-[300px] bg-gradient-to-b from-[#000080]/5 to-transparent pointer-events-none"></div>

      {/* TopAppBar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center h-16 px-8 w-full max-w-[1440px] mx-auto">
            <div className="text-xl font-black tracking-tight text-[#000080] font-h1">
                AegisTrack
            </div>
            <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-2 bg-white px-4 py-2 border border-gray-200 rounded-[6px] shadow-sm">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    <span className="font-['Inter'] font-semibold text-sm text-[#000080] tracking-wide">Secure Government Portal</span>
                </span>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-16 px-4 z-10">
        <div className="w-full max-w-[480px] bg-white border border-slate-200 rounded-[12px] shadow-[0_12px_40px_rgb(0,0,0,0.06)] overflow-hidden">
            <div className="p-10 flex flex-col items-center">
                
                {/* Emblem Section */}
                <div className="mb-10 flex flex-col items-center text-center">
                    <img alt="Government of India Emblem" className="h-[76px] mb-5 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbffRImwiQOtETAyESqV1sIZ8l4-JnF7L38NbB3pwt783rvFDR2ix-Ot_7PPKr1day8YHrTLSE5fkLpiZcn9NKzt4EK3pGS-ZPU4q94nIZqsYpvm1btTw0S5xIJF-E2hmSoycRbty13vM9EpI1KFxz_I2ZvpaNLHjfDGplQ4ToC3bZw4pd8lByl3EJYW29RjCnlBEqilctyqrieMX12wD4VCxZ3pMlBiCy5XbMnpwsfSTckAF8YD0gHkCZfz-8feLvdsSyrnwBmi3q"/>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#000080]/60 font-black mb-1.5">
                        Ministry of Tourism · Dept of Safety
                    </p>
                    <h1 className="text-[28px] font-black text-[#000080] leading-tight tracking-tight mb-10">
                        Aegis Authority Login
                    </h1>
                    <p className="text-[13px] text-slate-500 mb-10 font-medium">
                        National Tourist Safety Grid Portal
                    </p>
                    <div className="w-full border-b border-gray-100"></div>
                </div>

                {/* Login Form */}
                <form className="w-full space-y-6" onSubmit={handleLogin}>
                    
                    {errorMsg && (
                       <div className="bg-red-50 border-l-4 border-red-500 p-12 rounded-[6px] animate-in fade-in slide-in-from-top-2">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
                                </div>
                            </div>
                       </div>
                    )}

                    {/* Username */}
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm uppercase font-semibold text-slate-500 tracking-wider">
                            Service ID / Username
                        </label>
                        <input 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="rounded-[6px] h-12 px-4 border border-slate-300 focus:border-[#000080] focus:ring-1 focus:ring-[#000080] text-base transition-all bg-slate-50 focus:bg-white" 
                            placeholder="Enter Service ID (e.g., admin123)" 
                            type="text"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col space-y-2 relative">
                        <label className="text-sm uppercase font-semibold text-slate-500 tracking-wider">
                            Password
                        </label>
                        <div className="relative">
                            <input 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="rounded-[6px] w-full h-12 px-4 border border-slate-300 focus:border-[#000080] focus:ring-1 focus:ring-[#000080] text-base transition-all bg-slate-50 focus:bg-white" 
                                placeholder="••••••••" 
                                type="password"
                            />
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-[#FAEEDA]/50 border border-[#EF9F27]/60 p-12 rounded-[6px] flex items-start space-x-3 mt-8">
                        <span className="material-symbols-outlined text-[#EF9F27] text-[18px] mt-0.5">info</span>
                        <div>
                           <p className="text-[12px] text-[#856404] leading-relaxed font-semibold">
                                Sessions expire after 15 minutes of inactivity — IT Act Section 43A
                            </p>
                            <div className="mt-2 text-[11px] text-[#856404] italic">
                                <strong>Testing Credentials:</strong> <br/>
                                Admin: <code>admin123</code> / <code>password</code><br/>
                                Officer: <code>officer456</code> / <code>secure</code>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 pt-2">
                        <button 
                            disabled={loading}
                            className="rounded-[6px] w-full h-12 bg-[#000080] text-white font-bold hover:bg-[#000066] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-[#000080]/20 disabled:opacity-70" 
                            type="submit"
                        >
                            {loading ? (
                                <span className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Authenticating...</span>
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                        
                        <div className="flex items-center space-x-4 py-2">
                            <div className="flex-grow border-b border-gray-200"></div>
                            <span className="text-[11px] font-bold text-slate-400">OR</span>
                            <div className="flex-grow border-b border-gray-200"></div>
                        </div>
                        
                        <button className="rounded-[6px] w-full h-12 bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center space-x-3" type="button">
                            <div className="w-5 h-5 flex items-center justify-center">
                                <img alt="Parichay Logo" className="h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNK7dLMitQASE00LFDohWF0W66gcEygDqK9ez0uvpcHiVVDC0uTjCuuq-LY3sti6a7H9m0Js7zOomNpUx_wsGFuJLCof5vJw6JHwUWCbJlkJb5vszxSBgEyR-SglK8PhF0Z1vTVxKunBtfopIQ5nvAAQzm0Zdv_p-xjvnyJDfV7oCzrp8NFkQlS1sLYq2RPADZBpYE3Lqiy38FB7bOEquYCT-3CTCb979WBhB6FKRVlfu9tWrtTniWX26J09vSsAfTAEik-xLtviHb"/>
                            </div>
                            <span>Sign in with Parichay SSO</span>
                        </button>
                    </div>

                    <div className="pt-4 flex justify-center">
                        <button className="flex items-center space-x-2 text-[12px] font-bold text-[#CC0000] hover:underline uppercase tracking-tight" type="button">
                            <span className="material-symbols-outlined text-[16px]">warning</span>
                            <span>Emergency Access Override</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-auto">
        <div className="flex flex-col items-center py-8 px-4 w-full max-w-[1280px] mx-auto space-y-4">
            <div className="flex items-center space-x-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center space-x-1.5">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                    <span>256-bit TLS</span>
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>NIC-India hosted</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>CERT-In compliant</span>
            </div>
            <div className="text-center space-y-2">
                <p className="font-['Inter'] text-[11px] font-medium text-slate-500">
                    Authorized Personnel Only. Access to this system is monitored.
                </p>
                <div className="flex space-x-6 justify-center mt-2">
                    <a className="font-['Inter'] text-[11px] font-medium text-slate-400 hover:text-[#000080] transition-colors" href="#">Privacy Policy</a>
                    <a className="font-['Inter'] text-[11px] font-medium text-slate-400 hover:text-[#000080] transition-colors" href="#">Terms of Service</a>
                    <a className="font-['Inter'] text-[11px] font-medium text-slate-400 hover:text-[#000080] transition-colors" href="#">Security Guidelines</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
