import React from "react";
import { Camera, User, FileCheck2 } from "lucide-react";

export default function ConsentContent() {
  return (
    <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4 bg-transparent z-10">
      <p className="font-sans text-xs text-[#1A1A1A] leading-relaxed">
        By accepting, I grant my consent for the following:
      </p>

      <ul className="flex flex-col gap-3">
        <li className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-[#004225]/10 rounded-xl p-2 text-[#004225] flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="font-sans font-bold text-xs text-[#1A1A1A] block">1. Personal Details &amp; Account Verification</span>
            <span className="font-sans text-[10px] text-[#1A1A1A]/70 block mt-0.5 leading-normal">
              I consent to provide and share my personal details (Name, Student ID, Email) for identity verification and tracking my tour progress.
            </span>
          </div>
        </li>

        <li className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-[#004225]/10 rounded-xl p-2 text-[#004225] flex-shrink-0">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <span className="font-sans font-bold text-xs text-[#1A1A1A] block">2. Photo Capture &amp; Stamp Uploads</span>
            <span className="font-sans text-[10px] text-[#1A1A1A]/70 block mt-0.5 leading-normal">
              I authorize capturing and uploading my photos during landmark visits to verify my physical presence and unlock my digital passport stamps.
            </span>
          </div>
        </li>

        <li className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-[#004225]/10 rounded-xl p-2 text-[#004225] flex-shrink-0">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-sans font-bold text-xs text-[#1A1A1A] block">3. Data Accuracy &amp; Privacy Policy</span>
            <span className="font-sans text-[10px] text-[#1A1A1A]/70 block mt-0.5 leading-normal">
              I confirm that all personal details I provide are accurate and mine, and I agree to the secure processing of my data strictly for the campus tour.
            </span>
          </div>
        </li>
      </ul>

      {/* Ink Depression Note */}
      <div className="bg-[#CBA052]/10 p-3 rounded-2xl border border-[#CBA052]/30 mt-1">
        <p className="font-sans text-[10px] text-[#004225] leading-relaxed font-medium">
          My data remains strictly confidential and will be used exclusively for my VSU Campus Tour experience.
        </p>
      </div>
    </div>
  );
}


