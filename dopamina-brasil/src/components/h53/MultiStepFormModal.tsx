"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Zap } from "lucide-react";

interface MultiStepFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
}

export default function MultiStepFormModal({ isOpen, onClose, initialUrl = "" }: MultiStepFormModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    revenue: "",
    bottleneck: "",
    name: "",
    email: "",
    whatsapp: "",
    url: initialUrl,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialUrl) {
      setFormData((prev) => ({ ...prev, url: initialUrl }));
    }
  }, [initialUrl]);

  if (!isOpen) return null;

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-xl bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 md:p-8 text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#ccff00]" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
              Aplicação de Consultoria H53
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSubmitted ? (
          <div className="mt-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-8 text-xs font-mono text-gray-500">
              <span className={step >= 1 ? "text-[#ccff00] font-bold" : ""}>01. Faturamento</span>
              <span className={step >= 2 ? "text-[#ccff00] font-bold" : ""}>02. Diagnóstico</span>
              <span className={step >= 3 ? "text-[#ccff00] font-bold" : ""}>03. Contato</span>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h4 className="text-lg font-bold font-outfit">Qual o faturamento médio mensal da sua operação?</h4>
                  <div className="space-y-3">
                    {[
                      "R$ 100.000 a R$ 500.000 / mês",
                      "R$ 500.000 a R$ 2.000.000 / mês",
                      "Acima de R$ 2.000.000 / mês",
                    ].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, revenue: option });
                          handleNext();
                        }}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                          formData.revenue === option
                            ? "bg-[#ccff00]/10 border-[#ccff00] text-[#ccff00]"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <span>{option}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h4 className="text-lg font-bold font-outfit">Qual o maior gargalo atual do seu negócio?</h4>
                  <div className="space-y-3">
                    {[
                      "Abandono elevado no Checkout / Fricção",
                      "LTV Baixo / Pouca Recompra",
                      "CAC Elevado / Custo de Mídia Alto",
                      "Outro Desafio de Crescimento",
                    ].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, bottleneck: option });
                          handleNext();
                        }}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                          formData.bottleneck === option
                            ? "bg-[#ccff00]/10 border-[#ccff00] text-[#ccff00]"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <span>{option}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white pt-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar</span>
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <h4 className="text-lg font-bold font-outfit mb-4">Dados para Contato Prioritário</h4>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">E-mail Corporativo</label>
                    <input
                      type="email"
                      required
                      placeholder="seu.nome@empresa.com.br"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">WhatsApp</label>
                      <input
                        type="tel"
                        required
                        placeholder="(11) 99999-9999"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ccff00]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Website / URL</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ccff00]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar</span>
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-[#ccff00] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-colors flex items-center gap-2"
                    >
                      <span>Enviar Aplicação</span>
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 flex flex-col items-center text-center space-y-4"
          >
            <CheckCircle2 className="w-16 h-16 text-[#ccff00]" />
            <h4 className="text-2xl font-bold font-outfit text-white">Aplicação Registrada no Protocolo</h4>
            <p className="text-gray-400 text-sm max-w-md">
              Obrigado, <strong className="text-white">{formData.name}</strong>. Nossa equipe técnica de arquitetura de dados analisará seus parâmetros e entrará em contato via WhatsApp/E-mail em até 4 horas úteis.
            </p>
            <button
              onClick={handleReset}
              className="mt-6 px-6 py-3 bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-colors"
            >
              Fechar Janela
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
