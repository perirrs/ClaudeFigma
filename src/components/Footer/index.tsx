"use client";

const footerLinks = {
  Services: [
    "ServiceNow Implementation",
    "Managed Services",
    "Custom App Development",
    "Integration Services",
    "Migration & Upgrades",
    "Staff Augmentation",
  ],
  Solutions: [
    "IT Service Management",
    "Customer Service Management",
    "HR Service Delivery",
    "Security Operations",
    "IT Operations Management",
    "AI & Automation",
  ],
  Resources: [
    "Case Studies",
    "Blog",
    "Webinars",
    "Documentation",
    "ServiceNow Community",
    "Knowledge Base",
  ],
  Company: [
    "About Mergen",
    "Leadership",
    "Careers",
    "Partners",
    "News & Press",
    "Contact Us",
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white leading-tight">Mergen</span>
                <span className="text-[10px] text-gray-500 leading-tight tracking-wide">ServiceNow Partner</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              Premier ServiceNow partner helping enterprises put AI to work
              with intelligent workflows and expert-led implementations.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { label: "Li", title: "LinkedIn" },
                { label: "X", title: "Twitter" },
                { label: "YT", title: "YouTube" },
                { label: "GH", title: "GitHub" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  title={social.title}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Certifications bar */}
        <div className="py-8 border-t border-white/10 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-gray-500">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              ServiceNow Elite Partner
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              ISO 27001 Certified
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              SOC 2 Type II
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              150+ Certified Consultants
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Mergen. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy", "Sitemap"].map((item) => (
              <a key={item} href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
