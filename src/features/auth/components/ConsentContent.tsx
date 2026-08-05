import React from "react";
import { Camera, User } from "lucide-react";

export default function ConsentContent() {
  return (
    <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4 bg-transparent z-10">
      <p className="font-sans text-xs text-[#1A1A1A] leading-relaxed">
        Welcome to the Viscan E-Pasaporte campus tour! To provide you with an interactive and verified stamp experience, we request permission for the following actions:
      </p>

      <ul className="flex flex-col gap-3">
        <li className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-[#004225]/10 rounded-xl p-2 text-[#004225] flex-shrink-0">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <span className="font-sans font-bold text-xs text-[#1A1A1A] block">Photo Stamp Uploads</span>
            <span className="font-sans text-[10px] text-[#1A1A1A]/70 block mt-0.5 leading-normal">
              Photos captured are stored in our secure database to generate your digital passport stamp memories.
            </span>
          </div>
        </li>

        <li className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-[#004225]/10 rounded-xl p-2 text-[#004225] flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="font-sans font-bold text-xs text-[#1A1A1A] block">Account Verification</span>
            <span className="font-sans text-[10px] text-[#1A1A1A]/70 block mt-0.5 leading-normal">
              We verify your accounts by accessing your email and student ID for authentication purposes.
            </span>
          </div>
        </li>
      </ul>

      {/* Ink Depression Note */}
      <div className="bg-[#CBA052]/10 p-3 rounded-2xl border border-[#CBA052]/30 mt-1">
        <p className="font-sans text-[10px] text-[#004225] leading-relaxed font-medium">
          Your data is strictly confidential. We use it solely to run the VSU Campus Tour game and verify your physical visits.
        </p>
      </div>
    </div>
  );
}
