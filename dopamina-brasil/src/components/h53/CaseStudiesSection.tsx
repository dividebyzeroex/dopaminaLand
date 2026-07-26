"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/h53/ScrollReveal";
import { TrendingUp, ArrowUpRight, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

interface CaseStudy {
  id: string;
  category: "ecommerce" | "fashion" | "saas";
  client: string;
  industry: string;
  metric: string;
  metricLabel: string;
  title: string;
  summary: string;
  before: string;
  after: string;
  solution: string;
}

export default function CaseStudiesSection() {
  const [activeCategory, setActiveCategory] = useState<"all" | "ecommerce" | "fashion" | "saas">("all");
  const [expandedId, setExpandedId] = useState<string | null>("case-1");

  const cases: CaseStudy[] = [
    {
      id: "case-1",
      category: "ecommerce",
      client: "BigTech Eletrônicos",
      industry: "Varejo & Eletrônicos de Alto Ticket",
      metric: "+34.2%",
      metricLabel: "Aumento na Conversão do Checkout",
      title: "Eliminação de Fricção Cognitiva na Decisão de Compra do iPhone 17",
      summary: "Reestruturação da ancoragem de preço parcelado vs. à vista e eliminação de 4 campos redundantes no checkout.",
      before: "Taxa de abandono no checkout de 68.4%. O usuário levava média de 4.2 minutos para preencher dados.",
      after: "Abandono reduzido para 45.1%. Tempo médio de checkout caiu para 1.1 minuto com pré-preenchimento límbico.",
      solution: "Aplicamos Dark Pattern reverso de urgência ética e simplificamos a hierarquia visual dos botões de pagamento.",
    },
    {
      id: "case-2",
      category: "fashion",
      client: "Nordic Apparel",
      industry: "Moda Premium & D2C",
      metric: "+28.5%",
      metricLabel: "Aumento na Recompra (LTV de 90 Dias)",
      title: "Arquitetura do Loop de Dopamina no Pós-Venda",
      summary: "Criação de um sistema de recompensas variáveis dinâmicas enviadas por WhatsApp 3 dias após a entrega.",
      before: "Recompra média de 11.2% nos primeiros 90 dias com e-mails tradicionais de cupom estático.",
      after: "Recompra saltou para 39.7% com cupons dinâmicos revelados via raspadinha digital.",
      solution: "Engenharia de dopamina baseada no princípio de recompensa variável do sistema límbico.",
    },
    {
      id: "case-3",
      category: "saas",
      client: "CloudMetrics AI",
      industry: "SaaS Enterprise B2B",
      metric: "-45.0%",
      metricLabel: "Redução no Churn dos Primeiros 30 Dias",
      title: "Onboarding Neuromórfico sem Fricção Inicial",
      summary: "Redesenho da jornada de primeiro acesso focando na entrega instantânea do valor 'Aha! Moment'.",
      before: "52% dos usuários de teste nunca completavam a configuração inicial devido a 14 passos de onboarding.",
      after: "94% de conclusão do onboarding nos primeiros 8 minutos com micro-conquistas gamificadas.",
      solution: "Remoção de fricções de formulários e introdução de feedbacks táteis e sonoros de progresso.",
    },
  ];

  const filteredCases = activeCategory === "all" ? cases : cases.filter((c) => c.category === activeCategory);

  return (
    <section className="relative py-32 px-6 bg-[#050505] border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[#ccff00] font-bold tracking-widest text-xs uppercase mb-3 block">
                [PROVA SOCIAL & RESULTADOS]
              </span>
              <h2 className="text-4xl md:text-6xl font-black font-outfit uppercase tracking-tighter">
                Estudos de Caso Práticos
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 border border-white/10 rounded-xl">
              {[
                { id: "all", label: "Todos os Cases" },
                { id: "ecommerce", label: "E-Commerce" },
                { id: "fashion", label: "Moda & D2C" },
                { id: "saas", label: "SaaS B2B" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    activeCategory === tab.id
                      ? "bg-[#ccff00] text-black shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Case Cards Grid */}
        <div className="space-y-6">
          {filteredCases.map((c) => {
            const isExpanded = expandedId === c.id;
            return (
              <ScrollReveal key={c.id} width="100%">
                <div
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isExpanded
                      ? "bg-white/[0.04] border-[#ccff00]/40 shadow-[0_0_30px_rgba(204,255,0,0.05)]"
                      : "bg-white/[0.02] border-white/5 hover:border-white/20"
                  }`}
                >
                  {/* Card Header (Always Visible) */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-6"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/10 text-[#ccff00] font-bold">
                          {c.client}
                        </span>
                        <span className="text-xs text-gray-500">{c.industry}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold font-outfit text-white group-hover:text-[#ccff00] transition-colors">
                        {c.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
                      <div className="text-right">
                        <div className="text-3xl md:text-4xl font-black font-outfit text-[#ccff00] flex items-center justify-end gap-1">
                          <span>{c.metric}</span>
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium">{c.metricLabel}</p>
                      </div>
                      <div className="p-2 rounded-full bg-white/5 text-gray-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/10 px-6 md:px-8 py-6 bg-black/40 space-y-6"
                      >
                        <p className="text-sm text-gray-300 leading-relaxed font-light">{c.summary}</p>

                        <div className="grid md:grid-cols-2 gap-4 pt-2">
                          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                              Cenário Antes da H53
                            </span>
                            <p className="text-xs text-gray-400">{c.before}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-[#ccff00]/5 border border-[#ccff00]/20 space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#ccff00]">
                              Resultado Após Intervenção H53
                            </span>
                            <p className="text-xs text-gray-300">{c.after}</p>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#ccff00] shrink-0 mt-0.5" />
                          <div className="text-xs text-gray-300">
                            <strong className="text-white">Solução Aplicada:</strong> {c.solution}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
