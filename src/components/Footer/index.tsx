"use client";

const footerLinks = {
  Products: [
    "AI Agents", "IT Service Management", "Customer Service Management",
    "HR Service Delivery", "Security Operations", "IT Operations Management",
    "IT Asset Management", "Strategic Portfolio Management",
  ],
  Solutions: [
    "IT", "CRM", "Employee Experience", "Risk and Security",
    "App Development", "Industries",
  ],
  Learning: [
    "Mergen Academy", "Training & Certification", "Community",
    "Developer Resources", "Events", "Blog", "Customer Stories",
  ],
  Company: [
    "About Mergen", "Leadership", "Careers", "Partners",
    "News & Press", "Investor Relations", "Contact Us",
  ],
};

export default function Footer() {
  return (
    <footer className="bg-sn-nav border-t border-sn-border">
      <div className="sn-container py-14 lg:py-20">
        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-14">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-sn-text-dim hover:text-sn-green transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-sn-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-white tracking-tight">
                mergen<span className="text-sn-green">.</span>
              </span>
              <span className="text-xs text-sn-text-dim">Premier ServiceNow Partner</span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { label: "Li", title: "LinkedIn" },
                { label: "X", title: "Twitter" },
                { label: "YT", title: "YouTube" },
                { label: "FB", title: "Facebook" },
                { label: "IG", title: "Instagram" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  title={social.title}
                  className="w-8 h-8 rounded-full bg-white/5 border border-sn-border flex items-center justify-center text-[10px] font-bold text-sn-text-dim hover:text-sn-green hover:border-sn-green/30 transition-all"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Bottom links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-sn-border">
            <p className="text-xs text-sn-text-dim">
              &copy; {new Date().getFullYear()} Mergen. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {["Privacy Statement", "Terms of Use", "Cookie Policy", "Cookie Preferences", "Sitemap"].map((item) => (
                <a key={item} href="#" className="text-xs text-sn-text-dim hover:text-sn-text-muted transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
