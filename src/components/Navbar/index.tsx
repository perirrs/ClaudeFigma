"use client";

import { useState, useEffect, useRef } from "react";

const menuData: Record<string, { left: { heading: string; items: { label: string; href: string }[] }; featured: { label: string; desc: string; href: string }[]; highlight?: { title: string; desc: string; cta: string } }> = {
  Products: {
    left: {
      heading: "Products",
      items: [
        { label: "Featured Products", href: "#" },
        { label: "Mergen AI Platform", href: "#" },
        { label: "Demo Library", href: "#" },
      ],
    },
    featured: [
      { label: "AI Agents", desc: "Take action with autonomous AI agents that work for you.", href: "#" },
      { label: "IT Service Management", desc: "Transform service management for productivity and ROI.", href: "#" },
      { label: "AI Control Tower", desc: "Connect strategy, governance, and performance for all your AI.", href: "#" },
      { label: "IT Operations Management", desc: "Deliver proactive digital operations with AIOps.", href: "#" },
      { label: "Customer Service Management", desc: "Empower self-service, boost agent productivity.", href: "#" },
      { label: "Strategic Portfolio Management", desc: "Gain insights to move from strategy to business outcomes.", href: "#" },
      { label: "IT Asset Management", desc: "Improve technology use and spend over the IT asset lifecycle.", href: "#" },
      { label: "Governance, Risk, and Compliance", desc: "Enable an integrated approach that builds operational resilience.", href: "#" },
      { label: "Security Operations", desc: "Detect and resolve security threats and attacks.", href: "#" },
      { label: "Field Service Management", desc: "Reduce field service costs and improve efficiency.", href: "#" },
      { label: "HR Service Delivery", desc: "Give employees instant answers, guidance, and fast issue resolution.", href: "#" },
      { label: "EmployeeWorks", desc: "Stop chasing what other AI tools should have finished.", href: "#" },
    ],
    highlight: {
      title: "Meet the Autonomous Workforce",
      desc: "The Autonomous Workforce is more than just isolated tasks. These AI specialists are assigned to roles, with business context and permissions to handle complex workflows end-to-end.",
      cta: "Learn More",
    },
  },
  Industries: {
    left: {
      heading: "Industries",
      items: [{ label: "Learn More", href: "#" }],
    },
    featured: [
      { label: "Automotive", desc: "Put your automotive operations in overdrive with a single AI platform.", href: "#" },
      { label: "Banking", desc: "Future proof your bank with one AI platform.", href: "#" },
      { label: "Consumer Packaged Goods", desc: "Power product growth and efficiency with a single AI platform.", href: "#" },
      { label: "Healthcare", desc: "Fuel efficiency, reduce costs, and deliver quality care.", href: "#" },
      { label: "Insurance", desc: "Be the trusted carrier of choice with one AI platform.", href: "#" },
      { label: "Life Sciences", desc: "Accelerate innovation, in and out of the lab.", href: "#" },
      { label: "Manufacturing", desc: "Drive manufacturing efficiency with one AI platform.", href: "#" },
      { label: "Government", desc: "Deliver secure experiences for civilians, defense, and intelligence.", href: "#" },
      { label: "Retail", desc: "Enhance retail experiences with AI-powered insights.", href: "#" },
      { label: "Technology", desc: "Reimagine your tech lifecycle with a single AI platform.", href: "#" },
      { label: "Telecom", desc: "Drive revenue, automate operations, and manage infrastructure.", href: "#" },
    ],
  },
  Learning: {
    left: {
      heading: "Learning",
      items: [
        { label: "Mergen Academy", href: "#" },
        { label: "Community", href: "#" },
        { label: "Developer Resources", href: "#" },
        { label: "Events", href: "#" },
        { label: "Customer Stories", href: "#" },
        { label: "Blog", href: "#" },
      ],
    },
    featured: [
      { label: "Training & Certification", desc: "Explore certifications, career journeys, and expert programs.", href: "#" },
      { label: "Skill Your Team", desc: "Upskill your teams with scalable, role-based training.", href: "#" },
      { label: "Skilling Programs", desc: "Explore skilling programs that develop ServiceNow skilled talent.", href: "#" },
    ],
    highlight: {
      title: "Mergen Academy",
      desc: "Discover a playground for learning, designed to help develop the skills you need for an AI-driven world.",
      cta: "Start Learning",
    },
  },
  Support: {
    left: {
      heading: "Support",
      items: [
        { label: "Support Portal", href: "#" },
        { label: "Knowledge Base", href: "#" },
        { label: "Technical Support", href: "#" },
      ],
    },
    featured: [
      { label: "24/7 Expert Support", desc: "Get help from certified ServiceNow experts anytime.", href: "#" },
      { label: "Managed Services", desc: "Ongoing platform management and optimization.", href: "#" },
      { label: "Health Check", desc: "Comprehensive assessment of your ServiceNow instance.", href: "#" },
    ],
  },
  Partners: {
    left: {
      heading: "Partners",
      items: [
        { label: "Partner Program", href: "#" },
        { label: "Find a Partner", href: "#" },
        { label: "Become a Partner", href: "#" },
      ],
    },
    featured: [
      { label: "ServiceNow Partnership", desc: "Premier partner with deep platform expertise.", href: "#" },
      { label: "Technology Alliances", desc: "Integrated solutions with leading technology providers.", href: "#" },
      { label: "Partner Marketplace", desc: "Discover certified apps and integrations.", href: "#" },
    ],
  },
  Company: {
    left: {
      heading: "Company",
      items: [
        { label: "About Mergen", href: "#" },
        { label: "Leadership", href: "#" },
        { label: "Careers", href: "#" },
        { label: "News & Press", href: "#" },
        { label: "Contact Us", href: "#contact" },
      ],
    },
    featured: [
      { label: "Our Mission", desc: "Empowering enterprises to put AI to work for their people.", href: "#" },
      { label: "Global Presence", desc: "Serving clients across 30+ countries worldwide.", href: "#" },
      { label: "Social Responsibility", desc: "Making a positive impact in our communities.", href: "#" },
    ],
  },
};

const navKeys = Object.keys(menuData);

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleMouseEnter = (key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(key);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const menu = activeMenu ? menuData[activeMenu] : null;

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50">
      {/* Main nav bar */}
      <div className="bg-sn-nav/95 backdrop-blur-md border-b border-sn-border">
        <div className="sn-container flex items-center justify-between h-14">
          {/* Logo */}
          <a href="#" className="flex items-center gap-1.5 shrink-0">
            <span className="text-lg font-bold text-white tracking-tight">
              mergen<span className="text-sn-green">.</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-0">
            {navKeys.map((key) => (
              <button
                key={key}
                onMouseEnter={() => handleMouseEnter(key)}
                onClick={() => setActiveMenu(activeMenu === key ? null : key)}
                className={`px-3 py-2 text-[13px] font-medium transition-colors flex items-center gap-1 ${
                  activeMenu === key
                    ? "text-white"
                    : "text-sn-text-muted hover:text-white"
                }`}
              >
                {key}
                <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            <button className="p-2 text-sn-text-muted hover:text-white transition-colors" aria-label="Search">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 text-sn-text-muted hover:text-white transition-colors" aria-label="Globe">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </button>
            <a href="#" className="text-[13px] text-sn-text-muted hover:text-white transition-colors">Sign In</a>
            <a href="#contact" className="sn-btn-green !text-xs !px-4 !py-2">Get Started</a>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden p-2 text-white" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mega Menu */}
      {activeMenu && menu && (
        <div
          className="hidden lg:block bg-sn-nav border-b border-sn-border shadow-2xl animate-fade-in"
          onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="sn-container py-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Left column */}
              <div className="col-span-2">
                <h3 className="text-lg font-bold text-white mb-4">{menu.left.heading}</h3>
                <div className="space-y-1">
                  {menu.left.items.map((item) => (
                    <a key={item.label} href={item.href} className="flex items-center justify-between py-2 px-3 text-sm text-sn-text-muted hover:text-sn-green hover:bg-sn-bg-card rounded-lg transition-colors group">
                      <span className={item === menu.left.items[0] ? "text-sn-green font-medium" : ""}>{item.label}</span>
                      <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
                {activeMenu === "Products" && (
                  <div className="mt-6 pt-4 border-t border-sn-border">
                    <p className="text-xs text-sn-text-dim uppercase tracking-wider mb-3">Solutions</p>
                    {["IT", "CRM", "Risk and Security", "Employee Experience", "App Development"].map((s) => (
                      <a key={s} href="#" className="flex items-center justify-between py-1.5 px-3 text-sm text-sn-text-muted hover:text-sn-green rounded-lg transition-colors">
                        {s}
                        <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    ))}
                    <a href="#" className="flex items-center gap-1 mt-3 px-3 text-xs text-sn-green hover:underline">
                      View All Products <span>&rarr;</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Center - Featured products grid */}
              <div className="col-span-7">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-white">
                    {activeMenu === "Products" ? "Featured Products" : activeMenu === "Industries" ? "Industries" : activeMenu}
                  </h4>
                  {activeMenu === "Products" && (
                    <a href="#" className="sn-btn-outline-green !text-xs !px-3 !py-1.5">See All Products</a>
                  )}
                  {activeMenu === "Industries" && (
                    <a href="#" className="sn-btn-outline-green !text-xs !px-3 !py-1.5">Learn More</a>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                  {menu.featured.map((item) => (
                    <a key={item.label} href={item.href} className="group py-2.5">
                      <div className="text-sm font-semibold text-sn-green group-hover:underline">{item.label}</div>
                      <div className="text-xs text-sn-text-dim mt-0.5 leading-relaxed">{item.desc}</div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Right - Highlight card */}
              {menu.highlight && (
                <div className="col-span-3">
                  <div className="bg-sn-bg-card rounded-xl p-5 border border-sn-border">
                    <h4 className="text-sm font-bold text-white mb-2">{menu.highlight.title}</h4>
                    <p className="text-xs text-sn-text-dim leading-relaxed mb-4">{menu.highlight.desc}</p>
                    <a href="#" className="sn-btn-outline-green !text-xs !px-3 !py-1.5">{menu.highlight.cta}</a>
                  </div>
                </div>
              )}
              {!menu.highlight && <div className="col-span-3" />}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setActiveMenu(null)}
            className="absolute top-4 right-6 p-1.5 text-sn-text-muted hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-sn-nav border-t border-sn-border max-h-[85vh] overflow-y-auto">
          <div className="px-5 py-4 space-y-1">
            {navKeys.map((key) => (
              <div key={key}>
                <button
                  onClick={() => setActiveMenu(activeMenu === key ? null : key)}
                  className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-white hover:bg-sn-bg-card rounded-lg"
                >
                  {key}
                  <svg className={`w-4 h-4 transition-transform ${activeMenu === key ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeMenu === key && menu && (
                  <div className="ml-3 mb-2 space-y-0.5">
                    {menu.left.items.map((item) => (
                      <a key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-sn-text-muted hover:text-sn-green rounded-lg">
                        {item.label}
                      </a>
                    ))}
                    {menu.featured.slice(0, 5).map((item) => (
                      <a key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-sn-text-muted hover:text-sn-green rounded-lg">
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-sn-border">
              <a href="#contact" onClick={() => setMobileOpen(false)} className="sn-btn-green w-full text-center">Get Started</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
