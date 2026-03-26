"use client";

import { motion } from "framer-motion";

const trustedBy = [
  "Deloitte", "Accenture", "KPMG", "PwC", "EY", "Cognizant", "Infosys", "Wipro",
];

const solutions = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.662 48.662 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: "IT Service Management",
    description: "Modernize IT service delivery with AI-powered incident management, problem resolution, and change management on ServiceNow.",
    color: "bg-green-50 text-green-700 border-green-100",
    iconBg: "bg-green-100 text-green-600",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: "Customer Service Management",
    description: "Deliver seamless customer experiences with intelligent case routing, self-service portals, and proactive issue resolution.",
    color: "bg-blue-50 text-blue-700 border-blue-100",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
    title: "HR Service Delivery",
    description: "Transform employee experiences with automated onboarding, case management, and AI-driven HR workflows.",
    color: "bg-purple-50 text-purple-700 border-purple-100",
    iconBg: "bg-purple-100 text-purple-600",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Security Operations",
    description: "Automate threat response, vulnerability management, and security incident workflows with ServiceNow SecOps.",
    color: "bg-red-50 text-red-700 border-red-100",
    iconBg: "bg-red-100 text-red-600",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "AI & Automation",
    description: "Harness Now Assist and Mergen's AI expertise to build intelligent workflows that learn, predict, and act autonomously.",
    color: "bg-amber-50 text-amber-700 border-amber-100",
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: "IT Operations Management",
    description: "Gain full visibility into your IT infrastructure with event management, health log analytics, and cloud optimization.",
    color: "bg-teal-50 text-teal-700 border-teal-100",
    iconBg: "bg-teal-100 text-teal-600",
  },
];

export default function Features() {
  return (
    <>
      {/* Trusted By Strip */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] mb-8">
            Trusted by leading enterprises worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {trustedBy.map((name) => (
              <span key={name} className="text-gray-300 text-xl font-bold tracking-tight hover:text-gray-400 transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section id="solutions" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-green-600 uppercase tracking-[0.15em] mb-4"
            >
              Solutions
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5"
            >
              ServiceNow solutions that{" "}
              <span className="text-green-600">deliver results</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-gray-500 max-w-2xl mx-auto"
            >
              We implement, customize, and optimize ServiceNow across every
              product line to transform how your enterprise works.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((sol, i) => (
              <motion.div
                key={sol.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`group rounded-2xl border p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${sol.color}`}
              >
                <div className={`w-14 h-14 rounded-xl ${sol.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  {sol.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{sol.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{sol.description}</p>
                <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-green-700 group-hover:gap-2 transition-all">
                  Learn more
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
