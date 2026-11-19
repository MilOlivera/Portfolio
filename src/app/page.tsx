import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import ProjectsSection from "@/components/ProjectsSection";
import StackSection from "@/components/StackSection";
import StatsBar from "@/components/StatsBar";
import TerminalSection from "@/components/TerminalSection";
import TimelineSection from "@/components/TimelineSection";
import WorkflowSection from "@/components/WorkflowSection";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 flex-col">
        <Hero />
        <StatsBar />
        <TerminalSection />
        <ProjectsSection />
        <StackSection />
        <TimelineSection />
        <WorkflowSection />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
