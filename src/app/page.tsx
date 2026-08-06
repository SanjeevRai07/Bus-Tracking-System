import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import LiveStatus from "@/components/landing/LiveStatus";
import Features from "@/components/landing/Features";
import CampusPreview from "@/components/landing/CampusPreview";
import Stats from "@/components/landing/Stats";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <LiveStatus />
      <Features />
      <CampusPreview />
      <Stats />
    </>
  );
}