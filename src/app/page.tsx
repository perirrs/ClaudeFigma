"use client";

import Navbar from "@/components/Navbar";
import Banner from "@/components/Banner";
import Hero from "@/components/Hero";
import TrustedBy from "@/components/Features";
import InfinitySection from "@/components/InfinitySection";
import ProductTabs from "@/components/ProductTabs";
import AutonomousWorkflows from "@/components/Stats";
import CustomerStories from "@/components/Testimonials";
import Recognition from "@/components/Recognition";
import Insights from "@/components/Insights";
import GetToWork from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Banner />
      <Hero />
      <TrustedBy />
      <InfinitySection />
      <ProductTabs />
      <CustomerStories />
      <AutonomousWorkflows />
      <Recognition />
      <Insights />
      <GetToWork />
      <Footer />
    </main>
  );
}
