"use client";

import { useState } from "react";
import { X, Bell, Mail, Smartphone, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  currentPrice: number;
}

export default function PriceAlertModal({ isOpen, onClose, productName, currentPrice }: PriceAlertModalProps) {
  const [targetPrice, setTargetPrice] = useState(Math.round(currentPrice * 0.9)); // Default to 10% less
  const [contactMethod, setContactMethod] = useState<"email" | "whatsapp">("email");
  const [contactValue, setContactValue] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactValue) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          targetPrice,
          contactMethod,
          contactValue,
          currentPrice,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
          onClose();
        }, 2500);
      } else {
        setStatus("error");
      }
    } catch (e) {
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-border overflow-hidden pointer-events-auto"
            >
              {status === "success" ? (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Alerta Criado!</h3>
                  <p className="text-sm text-muted">
                    Você será notificado via {contactMethod === "email" ? "E-mail" : "WhatsApp"} assim que o preço cair para {formatBRL(targetPrice)}.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-5 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600">
                        <Bell className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Criar Alerta</h3>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full hover:bg-surface text-muted transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider">Produto</p>
                      <p className="text-sm text-foreground font-medium truncate" title={productName}>
                        {productName}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                        Preço Alvo desejado
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={Math.round(currentPrice * 0.5)}
                          max={currentPrice - 1}
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(Number(e.target.value))}
                          className="flex-1 h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="w-28 shrink-0 px-3 py-2 bg-surface-light border border-border rounded-xl text-center">
                          <span className="text-sm font-bold text-foreground">{formatBRL(targetPrice)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-light">
                        Preço atual: <span className="font-semibold">{formatBRL(currentPrice)}</span>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                        Onde receber o aviso
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setContactMethod("email")}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                            contactMethod === "email"
                              ? "bg-blue-50 border-blue-200 text-blue-700 font-semibold"
                              : "bg-surface-light border-border text-muted hover:border-border-dark"
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">E-mail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setContactMethod("whatsapp")}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                            contactMethod === "whatsapp"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold"
                              : "bg-surface-light border-border text-muted hover:border-border-dark"
                          }`}
                        >
                          <Smartphone className="w-4 h-4" />
                          <span className="text-sm">WhatsApp</span>
                        </button>
                      </div>

                      <div className="pt-2">
                        <input
                          type={contactMethod === "email" ? "email" : "tel"}
                          placeholder={contactMethod === "email" ? "seu@email.com" : "(11) 99999-9999"}
                          value={contactValue}
                          onChange={(e) => setContactValue(e.target.value)}
                          className="w-full px-4 py-3 bg-surface-light border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          required
                        />
                      </div>
                    </div>

                    {status === "error" && (
                      <p className="text-xs text-red-500 font-medium">Erro ao criar alerta. Tente novamente.</p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading" || !contactValue}
                      className="w-full py-3.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {status === "loading" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          Salvar Alerta
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
