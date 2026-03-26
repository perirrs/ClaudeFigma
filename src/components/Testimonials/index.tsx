"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const stories = [
  {
    company: "Adobe",
    metric: "25%",
    metricLabel: "faster outage resolution",
    gradient: "from-red-700/60 to-red-900/80",
  },
  {
    company: "Stellantis",
    metric: "48K",
    metricLabel: "employees successfully onboarded in one day",
    gradient: "from-blue-700/60 to-blue-900/80",
  },
  {
    company: "AstraZeneca",
    metric: "60%",
    metricLabel: "reduction in manual processes",
    gradient: "from-purple-700/60 to-purple-900/80",
  },
  {
    company: "Pepsico",
    metric: "3X",
    metricLabel: "faster incident resolution time",
    gradient: "from-blue-600/60 to-cyan-900/80",
  },
];

export default function CustomerStories() {
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setOffset((prev) => (prev + 1) % stories.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section className="sn-section" style={{ background: "linear-gradient(180deg, #0d1f22 0%, #0d1b1e 100%)" }}>
      <div className="sn-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sn-text-dim text-xs uppercase tracking-widest mb-2">Customer Stories</p>
            <h2 className="text-2xl md:text-3xl font-extrabold">
              <span className="sn-heading-green">Powering the enterprise,</span>{" "}
              <span className="text-white">the world works</span>
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <a href="#" className="sn-btn-outline-green !text-xs">See All Customer Stories</a>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-end gap-3 mb-6">
          <button onClick={() => setPaused(!paused)} className="w-9 h-9 rounded-full border border-sn-border flex items-center justify-center text-sn-text-muted hover:text-white transition-colors">
            {paused ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
            )}
          </button>
          <button onClick={() => setOffset((prev) => (prev - 1 + stories.length) % stories.length)} className="w-9 h-9 rounded-full border border-sn-border flex items-center justify-center text-sn-text-muted hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => setOffset((prev) => (prev + 1) % stories.length)} className="w-9 h-9 rounded-full border border-sn-border flex items-center justify-center text-sn-text-muted hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Cards carousel */}
        <div className="relative overflow-hidden">
          <div className="flex gap-4 transition-transform duration-500" style={{ transform: `translateX(-${offset * 25}%)` }}>
            {[...stories, ...stories].map((story, i) => (
              <div
                key={`${story.company}-${i}`}
                className={`shrink-0 w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] rounded-2xl bg-gradient-to-br ${story.gradient} border border-sn-border p-6 md:p-8 min-h-[220px] flex flex-col justify-between`}
              >
                <div>
                  <h3 className="text-lg font-extrabold text-white/90 mb-1">{story.company}</h3>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-extrabold text-white mb-1">{story.metric}</div>
                  <p className="text-xs text-white/60">{story.metricLabel}</p>
                  <div className="flex items-center gap-3 mt-4">
                    <a href="#" className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors">
                      Watch Video
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </a>
                    <a href="#" className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors">
                      Learn More &rarr;
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="md:hidden mt-6 text-center">
          <a href="#" className="sn-btn-outline-green !text-xs">See All Customer Stories</a>
        </div>
      </div>
    </section>
  );
}
