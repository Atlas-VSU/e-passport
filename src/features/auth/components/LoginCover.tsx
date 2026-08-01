import React from "react";

export default function LoginCover() {
  return (
    <section className="relative overflow-hidden rounded-t-4xl border border-[#00321c]/30 bg-[#004225] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.12)] passport-leather-overlay">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_42%)]" />
      <div className="absolute inset-x-4 bottom-3 h-px bg-[#CBA052]/40" />

      <header className="relative flex flex-col items-center text-center gap-4">
        <div className="flex items-center justify-center gap-5 px-3 py-2">
          <div className="w-15 h-15 md:w-17 md:h-17 flex items-center justify-center">
            <img
              className="h-full w-full object-contain"
              src="/vsu-brand-logo-gold-2.png"
              alt="Visayas State University Seal"
              style={{
                filter: "drop-shadow(0px 1.5px 1px rgba(0,0,0,0.9)) drop-shadow(0px 4px 6px rgba(0,0,0,0.5)) drop-shadow(0px 8px 16px rgba(0,0,0,0.3))"
              }}
            />
          </div>
          <div className="w-15 h-15 md:w-17 md:h-17 flex items-center justify-center">
            <img
              className="w-full h-full opacity-100"
              src="/ussc-logo-gold-2.png"
              alt="USSC Logo"
              style={{
                filter: "drop-shadow(0px 1.5px 1px rgba(0,0,0,0.9)) drop-shadow(0px 4px 6px rgba(0,0,0,0.5)) drop-shadow(0px 8px 16px rgba(0,0,0,0.3))"
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-[#F4D78A] uppercase tracking-[0.16em] sm:tracking-[0.22em] md:tracking-[0.28em] drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
            VISCAN
          </h1>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-[#F4D78A] uppercase tracking-[0.16em] sm:tracking-[0.22em] md:tracking-[0.28em] drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] whitespace-nowrap mb-2">
            E-PASAPORTE
          </h1>
          <p className="font-sans text-xs text-[#F6EEDC]/80 max-w-65 mx-auto leading-normal pb-8">
            Your digital ticket to the iconic VSU landmarks.
          </p>
        </div>
      </header>
    </section>
  );
}
