import GlassNav from '@/components/GlassNav';
import CinematicBackground from '@/components/CinematicBackground';
import HeroSection from '@/components/HeroSection';
import HowItWorksSection from '@/components/HowItWorksSection';

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex flex-col">
      <GlassNav />
      <CinematicBackground />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full">
        <HeroSection />
        
        {/* Spacer for scroll pacing */}
        <div className="h-[20vh] w-full" />
        
        <HowItWorksSection />
        
        {/* Footer Area */}
        <section className="h-screen w-full flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 serif-hero">
            Pronto para prever resultados?
          </h2>
          <button className="px-8 py-4 bg-white text-black font-semibold uppercase tracking-widest text-sm hover:bg-cyan-400 hover:text-black transition-colors rounded-sm">
            Quero antecipar vendas
          </button>
        </section>
      </div>
    </main>
  );
}
