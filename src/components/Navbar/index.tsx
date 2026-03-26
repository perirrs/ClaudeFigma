"use client";

import { useState, useEffect } from "react";

const navItems = [
  {
    label: "Services",
    submenu: [
      { label: "ServiceNow Implementation", href: "#" },
      { label: "Managed Services", href: "#" },
      { label: "Custom App Development", href: "#" },
      { label: "Integration Services", href: "#" },
      { label: "Migration & Upgrades", href: "#" },
    ],
  },
  {
    label: "Solutions",
    submenu: [
      { label: "IT Service Management", href: "#solutions" },
      { label: "IT Operations Management", href: "#solutions" },
      { label: "Customer Service Management", href: "#solutions" },
      { label: "HR Service Delivery", href: "#solutions" },
      { label: "Security Operations", href: "#solutions" },
    ],
  },
  {
    label: "Industries",
    submenu: [
      { label: "Financial Services", href: "#" },
      { label: "Healthcare", href: "#" },
      { label: "Government", href: "#" },
      { label: "Technology", href: "#" },
      { label: "Manufacturing", href: "#" },
    ],
  },
  { label: "Customers", href: "#customers" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md"
          : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      {/* Top utility bar */}
      <div className="hidden lg:block bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-end h-8 gap-6 text-xs">
          <a href="#" className="hover:text-green-400 transition-colors">Events</a>
          <a href="#" className="hover:text-green-400 transition-colors">Blog</a>
          <a href="#" className="hover:text-green-400 transition-colors">Support</a>
          <a href="#" className="hover:text-green-400 transition-colors">Careers</a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 lg:h-[72px]">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 leading-tight">Mergen</span>
            <span className="text-[10px] text-gray-500 leading-tight tracking-wide">ServiceNow Partner</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() =>
                item.submenu && setActiveDropdown(item.label)
              }
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <a
                href={(item as { href?: string }).href || "#"}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-green-700 transition-colors flex items-center gap-1 rounded-lg hover:bg-gray-50"
              >
                {item.label}
                {item.submenu && (
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </a>

              {item.submenu && activeDropdown === item.label && (
                <div className="absolute top-full left-0 pt-1 w-64">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2">
                    {item.submenu.map((sub) => (
                      <a
                        key={sub.label}
                        href={sub.href}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 opacity-0 group-hover:opacity-100" />
                        {sub.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-green-700 transition-colors px-3 py-2">
            Contact Us
          </a>
          <a href="#contact" className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 transition-colors shadow-sm">
            Get a Demo
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-gray-700"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
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

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 max-h-[80vh] overflow-y-auto shadow-xl">
          <div className="px-6 py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <a
                  href={(item as { href?: string }).href || "#"}
                  className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-green-50 rounded-lg"
                  onClick={() => !item.submenu && setMobileOpen(false)}
                >
                  {item.label}
                </a>
                {item.submenu && (
                  <div className="ml-4 space-y-0.5 mb-2">
                    {item.submenu.map((sub) => (
                      <a
                        key={sub.label}
                        href={sub.href}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-green-700 rounded-lg"
                        onClick={() => setMobileOpen(false)}
                      >
                        {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-gray-100">
              <a href="#contact" className="block w-full text-center px-5 py-3 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700">
                Get a Demo
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
