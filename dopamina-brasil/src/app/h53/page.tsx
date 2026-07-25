"use client";

import { motion } from "framer-motion";
import ScrollReveal from "@/components/h53/ScrollReveal";
import MagneticButton from "@/components/h53/MagneticButton";
import { ArrowRight, BrainCircuit, Activity, Eye, Zap, Search } from "lucide-react";
import Image from "next/image";

export default function H53LandingPage() {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#050505] z-[9900] text-white selection:bg-[#ccff00] selection:text-black font-inter scroll-smooth">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#ccff00]/10 blur-[150px]" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/h53/hero-bg.png" 
            alt="Data Intent Abstract" 
            fill 
            className="object-cover opacity-30 mix-blend-screen"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-[#ccff00] font-bold tracking-[0.3em] text-xs md:text-sm uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-[#ccff00]"></span>
              Data Intent Agency
              <span className="w-8 h-[1px] bg-[#ccff00]"></span>
            </h2>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-8xl font-black font-outfit tracking-tighter leading-[0.9] mb-8"
          >
            WE DECODE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">HUMAN INTENT.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 font-light"
          >
            A H53 não olha para os dados do passado. Nós antecipamos o comportamento futuro através de análise neural e neuromarketing de ponta.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8, type: "spring", stiffness: 100 }}
          >
            <MagneticButton>
              <button className="group relative px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-widest rounded-full overflow-hidden flex items-center gap-3">
                <span className="relative z-10">Agendar Consultoria</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-[#ccff00] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="relative py-32 px-6 bg-[#050505]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal direction="up">
            <h3 className="text-3xl md:text-5xl font-outfit font-bold leading-tight text-white mb-12">
              <span className="text-[#a855f7]">Esqueça os cliques.</span> O mercado atual é movido por fricção invisível e decisões irracionais. Nós construímos arquiteturas de conversão baseadas no sistema límbico humano.
            </h3>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 gap-16 mt-24">
            <ScrollReveal delay={0.2} direction="left">
              <p className="text-gray-400 text-lg leading-relaxed">
                Nascemos do laboratório do Dopaminado. Entendemos as métricas exatas de manipulação visual, escassez induzida e gatilhos de FOMO (Fear of Missing Out). 
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.4} direction="right">
              <p className="text-gray-400 text-lg leading-relaxed">
                Agora, aplicamos engenharia reversa para empresas que buscam dominar a retenção de atenção e maximizar a extração de LTV de forma ética e impiedosamente eficaz.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/h53/services-bg.png" 
            alt="Glassmorphism Texture" 
            fill 
            className="object-cover opacity-20"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-16">
              <div className="w-12 h-[1px] bg-white/20"></div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Capabilities</h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <ScrollReveal delay={0.1}>
              <div className="group relative p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors duration-500 overflow-hidden min-h-[320px] flex flex-col justify-between cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ccff00]/0 to-[#ccff00]/0 group-hover:from-[#ccff00]/10 transition-colors duration-500" />
                <BrainCircuit className="w-10 h-10 text-gray-500 group-hover:text-[#ccff00] transition-colors duration-500 mb-8" />
                <div>
                  <h3 className="text-2xl font-bold font-outfit mb-3">Neuromarketing <br/> Architecture</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Desenho de jornadas de usuário baseadas em picos de dopamina e fricção cognitiva reduzida.</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2 */}
            <ScrollReveal delay={0.2}>
              <div className="group relative p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors duration-500 overflow-hidden min-h-[320px] flex flex-col justify-between cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/0 to-[#a855f7]/0 group-hover:from-[#a855f7]/10 transition-colors duration-500" />
                <Activity className="w-10 h-10 text-gray-500 group-hover:text-[#a855f7] transition-colors duration-500 mb-8" />
                <div>
                  <h3 className="text-2xl font-bold font-outfit mb-3">Predictive <br/> Data Intent</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Análise preditiva de rastros comportamentais para mapear a intenção de compra antes do concorrente.</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 3 */}
            <ScrollReveal delay={0.3}>
              <div className="group relative p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors duration-500 overflow-hidden min-h-[320px] flex flex-col justify-between cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/10 transition-colors duration-500" />
                <Eye className="w-10 h-10 text-gray-500 group-hover:text-white transition-colors duration-500 mb-8" />
                <div>
                  <h3 className="text-2xl font-bold font-outfit mb-3">Dark Pattern <br/> Auditing</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Engenharia reversa das táticas de manipulação psicológica utilizadas por grandes corporações.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <section className="relative py-32 px-6 bg-[#050505] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-full bg-white/5" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl md:text-7xl font-black font-outfit tracking-tighter mb-8">
              PRONTO PARA DOMINAR <br/> SEU MERCADO?
            </h2>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <MagneticButton>
              <a href="mailto:contato@h53.com.br" className="inline-block relative px-10 py-5 bg-transparent border-2 border-[#ccff00] text-[#ccff00] font-bold text-sm uppercase tracking-widest rounded-full overflow-hidden hover:bg-[#ccff00] hover:text-black transition-colors duration-300">
                Iniciar Conversa
              </a>
            </MagneticButton>
          </ScrollReveal>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-between px-12 text-xs font-bold tracking-widest text-gray-600 uppercase">
          <span>© 2026 H53 Data Intent.</span>
          <span>SP / BR</span>
        </div>
      </section>
    </div>
  );
}
