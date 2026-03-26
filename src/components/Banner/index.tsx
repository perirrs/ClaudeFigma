"use client";

export default function Banner() {
  return (
    <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-sn-bg mt-14">
      <div className="sn-container flex items-center justify-center gap-3 h-10 text-xs md:text-sm font-medium">
        <span>Three days can change everything. Join us at Knowledge 2026 and put AI to work for you.</span>
        <a href="#" className="inline-flex items-center gap-1 px-3 py-1 border border-sn-bg/30 rounded-full text-xs font-semibold hover:bg-sn-bg/10 transition-colors">
          Register Now
        </a>
      </div>
    </div>
  );
}
