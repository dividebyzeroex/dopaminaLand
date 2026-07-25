"use client";

import { motion } from "framer-motion";
import ScrollReveal from "@/components/h53/ScrollReveal";
import MagneticButton from "@/components/h53/MagneticButton";
import { ArrowRight, BrainCircuit, Activity, Eye, Zap, Target, LineChart, Lock } from "lucide-react";
import Image from "next/image";

export default function H53LandingPage() {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#050505] z-[9900] text-white selection:bg-[#ccff00] selection:text-black font-inter scroll-smooth">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#ccff00]/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[150px]" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden px-6 pt-20">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/h53/hero-bg.png" 
            alt="Data Intent Abstract" 
            fill 
            className="object-cover opacity-30 mix-blend-screen"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/80 to-[#050505]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center mt-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-[#ccff00] font-bold tracking-[0.3em] text-xs md:text-sm uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-[#ccff00]"></span>
              H53 Data Intent Agency
              <span className="w-8 h-[1px] bg-[#ccff00]"></span>
            </h2>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-[7.5rem] font-black font-outfit tracking-tighter leading-[0.85] mb-8"
          >
            WE DECODE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">HUMAN INTENT.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-gray-400 text-lg md:text-2xl max-w-3xl mb-12 font-light"
          >
            A H53 não olha para os dados do passado. Nós antecipamos o comportamento futuro através de <strong className="text-white font-medium">análise preditiva</strong> e <strong className="text-white font-medium">arquitetura de neuromarketing</strong> para escalar o LTV da sua operação.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8, type: "spring", stiffness: 100 }}
          >
            <MagneticButton>
              <a href="#consultoria" className="group relative px-8 py-4 md:px-10 md:py-5 bg-white text-black font-bold text-sm uppercase tracking-widest rounded-full overflow-hidden flex items-center gap-3">
                <span className="relative z-10">Aplicar para Consultoria</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-[#ccff00] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </a>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Ticker Bar */}
        <div className="w-full mt-auto border-t border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden py-4 relative z-10">
          <motion.div 
            animate={{ x: [0, -1035] }} 
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="whitespace-nowrap flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-500"
          >
            {[...Array(3)].map((_, i) => (
              <span key={i} className="flex items-center gap-8">
                <span className="text-[#ccff00]">⚡</span> +240% LTV MÉDIO
                <span className="text-[#a855f7]">●</span> DARK PATTERNS REVERSOS
                <span className="text-white">▲</span> ZERO FRICÇÃO DE CHECKOUT
                <span className="text-[#ccff00]">⚡</span> 18M+ GATILHOS ANALISADOS
                <span className="text-[#a855f7]">●</span> LOOP DE DOPAMINA
                <span className="text-white">▲</span> ARQUITETURA LÍMBICA
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="relative py-32 px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <h3 className="text-4xl md:text-6xl font-outfit font-black leading-[1.1] text-white mb-16 max-w-4xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#ccff00]">ESQUEÇA OS CLIQUES.</span><br/>O MERCADO É MOVIDO POR FRICÇÃO INVISÍVEL E DECISÕES IRRACIONAIS.
            </h3>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 gap-16">
            <ScrollReveal delay={0.2} direction="left">
              <div className="space-y-6">
                <div className="w-12 h-[1px] bg-[#ccff00]"></div>
                <h4 className="text-xl font-bold uppercase tracking-widest text-white">A Ilusão do Controle</h4>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Os consumidores acreditam que estão no controle de suas decisões. Nós sabemos que não estão. A arquitetura do seu site dita exatamente o que, quando e como eles compram.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.4} direction="right">
              <div className="space-y-6">
                <div className="w-12 h-[1px] bg-[#a855f7]"></div>
                <h4 className="text-xl font-bold uppercase tracking-widest text-white">O Sistema Límbico</h4>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Nascemos do laboratório de análise comportamental do Dopaminado. Mapeamos os atalhos neurológicos que as Big Techs usam para monopolizar a atenção, e aplicamos essa engenharia reversa para o seu negócio crescer de forma impiedosa.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* The Methodology Section (New) */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/h53/methodology-bg.png" 
            alt="Methodology Abstract" 
            fill 
            className="object-cover opacity-20 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-[#050505]/70 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-20 border-b border-white/10 pb-8">
              <h2 className="text-4xl md:text-5xl font-black font-outfit uppercase tracking-tighter">O Framework H53</h2>
              <span className="text-[#ccff00] font-bold tracking-widest text-sm uppercase">Nossa Metodologia</span>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <ScrollReveal delay={0.1} direction="up">
              <div className="relative group">
                <div className="text-[6rem] font-black text-white/5 absolute -top-12 -left-6 z-0 group-hover:text-[#ccff00]/10 transition-colors duration-500">01</div>
                <div className="relative z-10">
                  <Target className="w-8 h-8 text-[#ccff00] mb-6" />
                  <h4 className="text-2xl font-bold font-outfit mb-4">Auditoria Cognitiva</h4>
                  <p className="text-gray-400 leading-relaxed">Mapeamos cada milissegundo de fricção cognitiva no seu fluxo. Cada pixel que gera dúvida, cada micro-texto que interrompe o fluxo límbico de decisão.</p>
                </div>
              </div>
            </ScrollReveal>
            
            {/* Step 2 */}
            <ScrollReveal delay={0.3} direction="up">
              <div className="relative group">
                <div className="text-[6rem] font-black text-white/5 absolute -top-12 -left-6 z-0 group-hover:text-[#a855f7]/10 transition-colors duration-500">02</div>
                <div className="relative z-10">
                  <Activity className="w-8 h-8 text-[#a855f7] mb-6" />
                  <h4 className="text-2xl font-bold font-outfit mb-4">Engenharia de Escassez</h4>
                  <p className="text-gray-400 leading-relaxed">Não mentimos, nós empacotamos a verdade. Aplicamos contadores visuais, prova social cruzada e ancoragem de preço (Dark Patterns éticos) para despertar o FOMO genuíno.</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal delay={0.5} direction="up">
              <div className="relative group">
                <div className="text-[6rem] font-black text-white/5 absolute -top-12 -left-6 z-0 group-hover:text-blue-500/10 transition-colors duration-500">03</div>
                <div className="relative z-10">
                  <Lock className="w-8 h-8 text-blue-500 mb-6" />
                  <h4 className="text-2xl font-bold font-outfit mb-4">Loop de Dopamina</h4>
                  <p className="text-gray-400 leading-relaxed">Construímos recompensas variáveis no pós-venda. O cliente não apenas compra, ele vicia na experiência de interagir com o seu ecossistema. Retenção blindada.</p>
                </div>
              </div>
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
            className="object-cover opacity-[0.15]"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-16">
              <div className="w-12 h-[1px] bg-white/20"></div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Core Capabilities</h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <ScrollReveal delay={0.1}>
              <div className="group relative p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 overflow-hidden min-h-[320px] flex flex-col justify-between cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ccff00]/0 to-[#ccff00]/0 group-hover:from-[#ccff00]/5 transition-colors duration-500" />
                <BrainCircuit className="w-10 h-10 text-gray-500 group-hover:text-[#ccff00] transition-colors duration-500 mb-8" />
                <div>
                  <h3 className="text-2xl font-bold font-outfit mb-3">Neuromarketing <br/> Architecture</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Desenho de jornadas baseadas em picos de dopamina e heurísticas de decisão irracional.</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2 */}
            <ScrollReveal delay={0.2}>
              <div className="group relative p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 overflow-hidden min-h-[320px] flex flex-col justify-between cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/0 to-[#a855f7]/0 group-hover:from-[#a855f7]/5 transition-colors duration-500" />
                <LineChart className="w-10 h-10 text-gray-500 group-hover:text-[#a855f7] transition-colors duration-500 mb-8" />
                <div>
                  <h3 className="text-2xl font-bold font-outfit mb-3">Predictive <br/> Data Intent</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Previsão algorítmica de churn e probabilidade de conversão cruzando 40+ variáveis de navegação.</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 3 */}
            <ScrollReveal delay={0.3}>
              <div className="group relative p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 overflow-hidden min-h-[320px] flex flex-col justify-between cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 transition-colors duration-500" />
                <Eye className="w-10 h-10 text-gray-500 group-hover:text-blue-500 transition-colors duration-500 mb-8" />
                <div>
                  <h3 className="text-2xl font-bold font-outfit mb-3">Dark Pattern <br/> Auditing</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Engenharia reversa das táticas de manipulação psicológica utilizadas por grandes corporações.</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 4 */}
            <ScrollReveal delay={0.4}>
              <div className="group relative p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 overflow-hidden min-h-[320px] flex flex-col justify-between cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 transition-colors duration-500" />
                <Zap className="w-10 h-10 text-gray-500 group-hover:text-red-500 transition-colors duration-500 mb-8" />
                <div>
                  <h3 className="text-2xl font-bold font-outfit mb-3">Zero-Friction <br/> Checkout</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Otimização impiedosa de formulários e pagamentos para destruir o abandono de carrinho.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Social Proof / Authority Section */}
      <section className="py-24 border-y border-white/10 bg-[#050505] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-gradient-to-l from-black via-black to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 w-[50%] h-[100%] bg-gradient-to-r from-black via-black to-transparent z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center relative z-20">
          <p className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-8">Nossa Tecnologia já auditou e extraiu inteligência das maiores engines do Brasil</p>
        </div>

        <motion.div 
          animate={{ x: [0, -1000] }} 
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="flex items-center gap-16 text-3xl md:text-5xl font-black font-outfit opacity-20 whitespace-nowrap px-6 relative z-0"
        >
          <span>FAST SHOP</span>
          <span>●</span>
          <span>MERCADO LIVRE</span>
          <span>●</span>
          <span>AMAZON BRASIL</span>
          <span>●</span>
          <span>SHOPEE</span>
          <span>●</span>
          <span>KABUM!</span>
          <span>●</span>
          <span>MAGALU</span>
          <span>●</span>
          <span>NETSHOES</span>
          <span>●</span>
          <span>ALIEXPRESS</span>
          <span>●</span>
          <span>CASAS BAHIA</span>
          <span>●</span>
          {/* Repeat for seamless loop */}
          <span>FAST SHOP</span>
          <span>●</span>
          <span>MERCADO LIVRE</span>
          <span>●</span>
          <span>AMAZON BRASIL</span>
          <span>●</span>
          <span>SHOPEE</span>
          <span>●</span>
          <span>KABUM!</span>
          <span>●</span>
          <span>MAGALU</span>
          <span>●</span>
          <span>NETSHOES</span>
          <span>●</span>
          <span>ALIEXPRESS</span>
          <span>●</span>
          <span>CASAS BAHIA</span>
        </motion.div>
      </section>

      {/* Footer / CTA with Scarcity */}
      <section id="consultoria" className="relative py-40 px-6 bg-[#050505] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-[#ccff00]/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-full bg-[#ccff00]/10" />
        <div className="absolute inset-0 blur-3xl opacity-50 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(204,255,0,0.05) 0%, transparent 70%)' }} />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <ScrollReveal>
            <div className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold tracking-widest uppercase mb-8 animate-pulse">
              ⚠️ ATENÇÃO: APENAS 3 VAGAS DE CONSULTORIA RESTANTES PARA Q3
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h2 className="text-5xl md:text-8xl font-black font-outfit tracking-tighter mb-8 leading-[0.9]">
              NÃO DEIXE A CONCORRÊNCIA <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">HACKEAR SEU CLIENTE ANTES DE VOCÊ.</span>
            </h2>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light">
              Nossa operação de arquitetura comportamental exige envolvimento profundo. Trabalhamos apenas com e-commerces e SaaS que faturam múltiplos 7-dígitos. Se você está pronto para dominar seu mercado de forma implacável, inicie o protocolo.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <MagneticButton>
              <a href="mailto:contato@h53.com.br?subject=Aplicação de Consultoria - H53" className="inline-flex relative px-12 py-6 bg-white text-black font-black text-sm uppercase tracking-[0.2em] rounded-full overflow-hidden items-center gap-4 group">
                <span className="relative z-10">INICIAR PROTOCOLO</span>
                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                <div className="absolute inset-0 bg-[#ccff00] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out" />
              </a>
            </MagneticButton>
          </ScrollReveal>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-between px-12 text-[10px] font-bold tracking-widest text-gray-700 uppercase">
          <span>© 2026 H53 DATA INTENT AGENCY. ALL RIGHTS RESERVED.</span>
          <span>CONFIDENTIAL INTELLECTUAL PROPERTY</span>
        </div>
      </section>
    </div>
  );
}

