"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  {
    id: "it",
    label: "IT",
    headline: "The best incident is the one that never happens",
    description: "Shift from reactive management to Autonomous IT. Anticipate, resolve, and secure issues before they disrupt the business.",
    cta: "Build Autonomous IT",
    links: ["IT Service Management", "IT Operations Management", "IT Asset Management", "Strategic Portfolio Management"],
    card: {
      title: "Incident summarized by AI agents",
      issue: "Employee is facing an issue with the Rewards Processing application.",
      actions: ["Issue escalated", "Issue was escalated to IT to investigate.", "Restart application", "Restarting the application was attempted."],
    },
  },
  {
    id: "crm",
    label: "CRM",
    headline: "Turn every customer interaction into lasting loyalty",
    description: "Unify customer service across channels with AI-powered case management, proactive outreach, and seamless self-service.",
    cta: "Transform Customer Service",
    links: ["Customer Service Management", "Field Service Management", "Order Management", "Customer Workflows"],
    card: {
      title: "Case routed by AI agent",
      issue: "Customer reported billing discrepancy on enterprise account.",
      actions: ["Priority assigned", "Case classified as high-priority enterprise.", "Agent notified", "Specialist agent assigned within 30 seconds."],
    },
  },
  {
    id: "employee",
    label: "Employee Experience",
    headline: "Give every employee a brilliant experience",
    description: "From onboarding to everyday requests, AI-powered HR workflows that make work life simpler and more productive.",
    cta: "Elevate Employee Experience",
    links: ["HR Service Delivery", "Workplace Service Delivery", "Legal Service Delivery", "Employee Center"],
    card: {
      title: "Onboarding automated by AI",
      issue: "New hire starting in Engineering department on Monday.",
      actions: ["Equipment ordered", "Laptop and peripherals auto-provisioned.", "Access granted", "All required system access configured."],
    },
  },
  {
    id: "risk",
    label: "Risk and Security",
    headline: "Protect your enterprise with intelligent security",
    description: "Detect, respond to, and recover from threats faster with automated security operations and integrated risk management.",
    cta: "Strengthen Security",
    links: ["Security Operations", "Governance Risk and Compliance", "Vulnerability Response", "Security Incident Response"],
    card: {
      title: "Threat detected by AI agent",
      issue: "Anomalous login pattern detected from unauthorized region.",
      actions: ["Account locked", "User account temporarily suspended.", "Team alerted", "Security team notified with full context."],
    },
  },
  {
    id: "appdev",
    label: "App Development",
    headline: "Build enterprise apps at the speed of business",
    description: "Low-code development, AI-assisted creation, and a robust platform to build, test, and deploy custom applications.",
    cta: "Start Building",
    links: ["App Engine", "Integration Hub", "Automation Engine", "AI Platform"],
    card: {
      title: "App deployed by AI pipeline",
      issue: "New procurement workflow app ready for production.",
      actions: ["Tests passed", "All 247 automated tests passed successfully.", "Deployed", "App live in production environment."],
    },
  },
];

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState("it");
  const tab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section className="sn-section" style={{ background: "linear-gradient(180deg, #0d1b1e 0%, #0a171a 50%, #0d1f22 100%)" }}>
      <div className="sn-container">
        {/* Tab bar */}
        <div className="flex items-center justify-center mb-12">
          <div className="inline-flex bg-sn-bg-card rounded-full p-1 border border-sn-border">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 md:px-6 py-2.5 text-xs md:text-sm font-medium rounded-full transition-all ${
                  activeTab === t.id
                    ? "bg-white/10 text-white"
                    : "text-sn-text-dim hover:text-sn-text-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start"
          >
            {/* Left - text */}
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-5">
                {tab.headline}
              </h2>
              <p className="text-sm md:text-base text-sn-text-muted leading-relaxed mb-8 max-w-lg">
                {tab.description}
              </p>
              <a href="#" className="sn-btn-outline-green mb-8 inline-flex">{tab.cta}</a>
              <div className="space-y-3 mt-4">
                {tab.links.map((link) => (
                  <a key={link} href="#" className="flex items-center gap-2 text-sm text-sn-text-muted hover:text-sn-green transition-colors group">
                    <svg className="w-4 h-4 text-sn-green group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Right - AI card mockup */}
            <div className="relative">
              <div className="rounded-2xl bg-sn-bg-card border border-sn-border overflow-hidden shadow-2xl">
                {/* Card header */}
                <div className="px-5 py-3 border-b border-sn-border flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-sn-green/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-sn-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-white">{tab.card.title}</span>
                </div>
                {/* Card body */}
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-sn-green font-semibold mb-1">Issue</p>
                    <p className="text-sm text-sn-text-muted">{tab.card.issue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sn-green font-semibold mb-2">Actions Taken</p>
                    <div className="space-y-2.5">
                      {Array.from({ length: tab.card.actions.length / 2 }).map((_, i) => (
                        <div key={i} className="rounded-lg bg-white/[0.03] border border-sn-border p-3">
                          <p className="text-xs font-semibold text-white mb-0.5">{tab.card.actions[i * 2]}</p>
                          <p className="text-xs text-sn-text-dim">{tab.card.actions[i * 2 + 1]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Card footer controls */}
                <div className="px-5 py-3 border-t border-sn-border flex items-center gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-7 h-7 rounded-lg bg-white/5 border border-sn-border" />
                  ))}
                </div>
              </div>

              {/* Photo placeholder */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -right-4 w-32 h-40 rounded-xl overflow-hidden border-2 border-sn-border bg-gradient-to-br from-blue-900/50 to-purple-900/50 shadow-xl hidden lg:flex items-end justify-center"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
