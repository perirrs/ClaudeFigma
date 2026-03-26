"use client";

import { motion } from "framer-motion";

const stories = [
  {
    quote: "Mergen transformed our ServiceNow instance from a basic ticketing tool into an enterprise-wide automation platform. We reduced incident resolution time by 73%.",
    author: "Sarah Chen",
    title: "CTO, Fortune 500 Financial Services Company",
    avatar: "SC",
    gradient: "from-green-500 to-emerald-600",
    metric: "73%",
    metricLabel: "Faster Resolution",
  },
  {
    quote: "Their expertise in ServiceNow ITSM and ITOM helped us achieve visibility across 50,000+ CIs. The proactive monitoring has eliminated unplanned outages.",
    author: "Marcus Rivera",
    title: "VP of IT Operations, Global Healthcare Provider",
    avatar: "MR",
    gradient: "from-blue-500 to-cyan-600",
    metric: "99.9%",
    metricLabel: "Uptime Achieved",
  },
  {
    quote: "Mergen's HR Service Delivery implementation streamlined our onboarding from 3 weeks to 3 days. The employee experience has been completely transformed.",
    author: "Dr. Amara Osei",
    title: "CHRO, Technology Enterprise",
    avatar: "AO",
    gradient: "from-purple-500 to-violet-600",
    metric: "85%",
    metricLabel: "Faster Onboarding",
  },
];

export default function Testimonials() {
  return (
    <section id="customers" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-green-600 uppercase tracking-[0.15em] mb-4"
          >
            Customer Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5"
          >
            Trusted by enterprises{" "}
            <span className="text-green-600">worldwide</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto"
          >
            See how leading organizations partner with Mergen to unlock the
            full potential of ServiceNow.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, i) => (
            <motion.div
              key={story.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {/* Metric highlight */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className={`text-4xl font-bold bg-gradient-to-r ${story.gradient} bg-clip-text text-transparent`}>
                  {story.metric}
                </div>
                <div className="text-sm font-medium text-gray-500">{story.metricLabel}</div>
              </div>

              {/* Quote */}
              <svg className="w-8 h-8 text-green-200 mb-4" fill="currentColor" viewBox="0 0 32 32">
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
              </svg>
              <p className="text-gray-600 leading-relaxed mb-8">
                &ldquo;{story.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${story.gradient} flex items-center justify-center text-sm font-bold text-white`}>
                  {story.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{story.author}</div>
                  <div className="text-xs text-gray-400">{story.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
