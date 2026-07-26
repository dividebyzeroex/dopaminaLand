"use client";

import ScrollReveal from "@/components/h53/ScrollReveal";
import { Cpu, Microchip, Binary, Database, FlaskConical, Radio } from "lucide-react";

export default function InsideTheLabSection() {
  return (
    <section className="relative py-32 px-6 bg-[#050505] border-t border-white/10 overflow-hidden">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#a855f7] mb-4">
            <FlaskConical className="w-4 h-4" />
            <span>[INSIDE THE LAB: CIÊNCIA & TELEMETRIA]</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black font-outfit uppercase tracking-tighter max-w-3xl mb-8">
            Nascidos do Maior Laboratório de Comportamento do Brasil
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl leading-relaxed mb-16">
            A H53 não utiliza achismos ou teorias obsoletas de marketing. Nossa inteligência é alimentada pela telemetria contínua do ecossistema <strong className="text-white">Dopaminado Brasil</strong>, onde mapeamos o comportamento de milhões de decisões de compra sem viés.
          </p>
        </ScrollReveal>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-20">
          <ScrollReveal delay={0.1}>
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
              <div className="text-4xl md:text-5xl font-black font-outfit text-[#ccff00] mb-2">18.4M+</div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Interações Analisadas</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
              <div className="text-4xl md:text-5xl font-black font-outfit text-[#a855f7] mb-2">400ms</div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Latência Média de Decisão</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
              <div className="text-4xl md:text-5xl font-black font-outfit text-white mb-2">120+</div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Gatilhos Mapeados</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
              <div className="text-4xl md:text-5xl font-black font-outfit text-blue-400 mb-2">99.4%</div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Precisão de Predição</p>
            </div>
          </ScrollReveal>
        </div>

        {/* Technical Pillars */}
        <div className="grid md:grid-cols-2 gap-8">
          <ScrollReveal delay={0.1} direction="left">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
              <Radio className="w-8 h-8 text-[#ccff00]" />
              <h3 className="text-xl font-bold font-outfit">1. Telemetria Comportamental em Tempo Real</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Rastreia a velocidade de rolagem, paradas de cursor e hesitação de toque para identificar pontos exatos onde o cérebro do comprador sente dúvida ou ansiedade de preço.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} direction="right">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
              <Binary className="w-8 h-8 text-[#a855f7]" />
              <h3 className="text-xl font-bold font-outfit">2. Algoritmos de Ancoragem Dinâmica</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Ajuste automático de opções de parcelamento e descontos visualmente ancorados para tornar o menor valor a única opção racional percebida.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
