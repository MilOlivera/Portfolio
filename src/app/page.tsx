import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import ProjectsSection from "@/components/ProjectsSection";
import StatsBar from "@/components/StatsBar";
import TerminalSection from "@/components/TerminalSection";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 flex-col">
        <Hero />
        <StatsBar />
        <TerminalSection />
        <ProjectsSection />
      </main>
    </>
  );
}
