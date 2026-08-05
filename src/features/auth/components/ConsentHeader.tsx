import React from "react";
import { ShieldCheck } from "lucide-react";

export default function ConsentHeader() {
  return (
    <div className="bg-[#004225] p-5 pb-6 border-b-4 border-[#CBA052] relative overflow-hidden flex flex-col items-center text-white z-10 flex-shrink-0 passport-leather-overlay">
      <div className="flex items-center justify-center mb-2 bg-white rounded-full p-3 shadow-md">
        <ShieldCheck className="w-8 h-8 text-[#004225]" />
      </div>
      <h1 className="font-serif text-xl font-black tracking-tight text-white text-center">Data Consent</h1>
      <p className="font-mono text-[8px] text-[#CBA052] text-center mt-0.5 uppercase tracking-widest font-black">
        Security &amp; Verification
      </p>
    </div>
  );
}
