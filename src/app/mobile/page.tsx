'use client';
import { useRouter } from 'next/navigation';

export default function MobileScreen() {
 const router = useRouter();
 return (
  <>
   
{/* TopAppBar */}
<header className="bg-white border-b border-gray-200 sticky top-0 z-50">
<div className="flex justify-between items-center h-12 px-8 w-full max-w-[1280px] mx-auto">
<div className="text-xl font-bold tracking-tight text-[#000080] font-h1">
        AegisTrack
      </div>
<div className="flex items-center space-x-3">
<span className="flex items-center space-x-2 bg-gray-50 px-8 py-8.5 border border-gray-200 ">
<span className="w-2 h-12 bg-green-600 rounded-full"></span>
<span className="font-['Inter'] font-semibold text-base text-[#000080]">Secure Government Portal</span>
</span>
</div>
</div>
</header>
{/* Main Content */}
<main className="flex-grow flex items-center justify-center py-82 px-8">
<div className="w-full max-w-[560px] flex flex-col items-center">
{/* Emblem Section */}
<div className="mb-10 flex flex-col items-center text-center">
<img alt="Government of India Emblem" className="h-[68px] mb-4" data-alt="The national emblem of India depicting the Ashoka Pillar with four lions in full color against a white background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbffRImwiQOtETAyESqV1sIZ8l4-JnF7L38NbB3pwt783rvFDR2ix-Ot_7PPKr1day8YHrTLSE5fkLpiZcn9NKzt4EK3pGS-ZPU4q94nIZqsYpvm1btTw0S5xIJF-E2hmSoycRbty13vM9EpI1KFxz_I2ZvpaNLHjfDGplQ4ToC3bZw4pd8lByl3EJYW29RjCnlBEqilctyqrieMX12wD4VCxZ3pMlBiCy5XbMnpwsfSTckAF8YD0gHkCZfz-8feLvdsSyrnwBmi3q"/>
<p className="text-sm uppercase tracking-[0.12em] text-gray-500 font-medium mb-1">
          Ministry of Tourism · Department of Safety
        </p>
<h1 className="text-[32px] font-bold text-[#000080] leading-tight mb-1">
          AegisTrack
        </h1>
<p className="text-[13px] text-gray-500 mb-10">
          National Tourist Safety Grid
        </p>
<div className="w-full border-b border-gray-200"></div>
</div>
{/* Department Selector */}
<div className="w-full mb-8">
<div className="grid grid-cols-4 gap-0 border border-[#d0d5dd] overflow-hidden">
<button className="rounded-[6px] h-12 py-8 px-8 text-sm font-semibold bg-[#000080] text-white border-r border-[#000080]">
            Police
          </button>
<button className="rounded-[6px] h-12 py-8 px-8 text-sm font-semibold bg-white text-gray-600 hover:bg-gray-50 border-r border-[#d0d5dd] transition-colors">
            Tourism
          </button>
<button className="rounded-[6px] h-12 py-8 px-8 text-sm font-semibold bg-white text-gray-600 hover:bg-gray-50 border-r border-[#d0d5dd] transition-colors">
            Emergency
          </button>
<button className="rounded-[6px] h-12 py-8 px-8 text-sm font-semibold bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            Municipal
          </button>
</div>
</div>
{/* Login Form */}
<form className="w-full space-y-6">
{/* Username */}
<div className="flex flex-col space-y-6.5">
<label className="rounded-[6px] h-12 text-sm uppercase font-medium text-[#9ca3af] tracking-wider">
            Service ID / Username
          </label>
<input className="rounded-[6px] h-12 px-8 border border-[#d0d5dd] focus:border-[#000080] focus:ring-0 text-base transition-colors" placeholder="Enter your credential" type="text"/>
</div>
{/* Password */}
<div className="flex flex-col space-y-6.5 relative">
<label className="rounded-[6px] h-12 text-sm uppercase font-medium text-[#9ca3af] tracking-wider">
            Password
          </label>
<div className="relative">
<input className="rounded-[6px] w-full h-12 px-8 pr-12 border border-[#d0d5dd] focus:border-[#000080] focus:ring-0 text-base transition-colors" placeholder="••••••••" type="password"/>
<button className="rounded-[6px] h-12 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" type="button">
<span className="material-symbols-outlined text-[20px]" data-icon="visibility">visibility</span>
</button>
</div>
</div>
{/* Remember & Forgot */}
<div className="flex items-center justify-between">
<label className="font-medium rounded-[6px] h-12 flex items-center space-x-2 cursor-pointer">
<input className="rounded-[6px] w-4 h-12 text-[#000080] border-[#d0d5dd] focus:ring-0 " type="checkbox"/>
<span className="text-sm text-gray-600">Restrict to this terminal</span>
</label>
<a className="text-[12px] font-semibold text-[#000080] hover:underline" href="/authority">
            Forgot credentials?
          </a>
</div>
{/* Security Notice */}
<div className="bg-[#FAEEDA] border border-[#EF9F27] p-12 flex items-start space-x-3">
<span className="material-symbols-outlined text-[#EF9F27] text-[18px] mt-0.5" data-icon="info">info</span>
<p className="text-[12px] text-[#856404] leading-relaxed">
            Sessions expire after 15 minutes of inactivity — IT Act Section 43A
          </p>
</div>
{/* Actions */}
<div className="space-y-6">
<button className="rounded-[6px] w-full h-12 bg-[#000080] text-white font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center" type="submit">
            Sign In
          </button>
<div className="flex items-center space-x-4">
<div className="flex-grow border-b border-gray-200"></div>
<span className="text-sm font-bold text-[#9ca3af]">OR</span>
<div className="flex-grow border-b border-gray-200"></div>
</div>
<button onClick={() => router.push('/wearable/W-92')} type="button" className="w-full rounded-[6px] h-14 bg-white border border-slate-300 shadow-sm flex items-center justify-center space-x-3 text-slate-700 font-semibold hover:bg-slate-50 active:bg-slate-100 transition-colors">
                        <img alt="Parichay Logo" className="h-12" data-alt="Small Indian flag representing the Parichay SSO authentication system" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNK7dLMitQASE00LFDohWF0W66gcEygDqK9ez0uvpcHiVVDC0uTjCuuq-LY3sti6a7H9m0Js7zOomNpUx_wsGFuJLCof5vJw6JHwUWCbJlkJb5vszxSBgEyR-SglK8PhF0Z1vTVxKunBtfopIQ5nvAAQzm0Zdv_p-xjvnyJDfV7oCzrp8NFkQlS1sLYq2RPADZBpYE3Lqiy38FB7bOEquYCT-3CTCb979WBhB6FKRVlfu9tWrtTniWX26J09vSsAfTAEik-xLtviHb"/>
                        <div className="h-5 w-px bg-slate-300"></div>
                        <span>Sign in with Parichay SSO</span>
                    </button>
</div>
{/* Emergency Override */}
<div className="pt-4 flex justify-center">
<button className="rounded-[6px] h-12 flex items-center space-x-2 text-[12px] font-bold text-[#CC0000] hover:underline uppercase tracking-tight" type="button">
<span className="material-symbols-outlined text-[16px]" data-icon="warning">warning</span>
<span>Emergency Access Override</span>
</button>
</div>
</form>
</div>
</main>
{/* Footer */}
<footer className="bg-white border-t border-gray-200">
<div className="flex flex-col items-center py-8 px-8 w-full max-w-[1280px] mx-auto space-y-6">
{/* Compliance Text */}
<div className="flex items-center space-x-4 text-sm font-medium text-[#9ca3af] uppercase tracking-wide">
<span className="flex items-center space-x-1.5">
<span className="material-symbols-outlined text-[14px]" data-icon="lock" data-weight="fill" >lock</span>
<span>256-bit TLS</span>
</span>
<span className="w-1 h-12 bg-gray-300 rounded-full"></span>
<span>NIC-India hosted</span>
<span className="w-1 h-12 bg-gray-300 rounded-full"></span>
<span>CERT-In compliant</span>
</div>
{/* Mandatory Footer Text */}
<div className="text-center space-y-6">
<p className="font-['Inter'] text-sm leading-tight text-gray-500">
          Authorized Personnel Only. Access to this system is monitored and recorded.
        </p>
<div className="flex space-x-4">
<a className="font-['Inter'] text-sm text-gray-400 hover:text-[#000080] underline transition-all duration-200" href="/authority">Privacy Policy</a>
<a className="font-['Inter'] text-sm text-gray-400 hover:text-[#000080] underline transition-all duration-200" href="/authority">Terms of Service</a>
<a className="font-['Inter'] text-sm text-gray-400 hover:text-[#000080] underline transition-all duration-200" href="/authority">Security Guidelines</a>
</div>
</div>
</div>
</footer>

  </>
 );
}
