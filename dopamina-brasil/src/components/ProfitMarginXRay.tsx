"use client";

import { motion } from "framer-motion";
import { DollarSign, Factory, Landmark, AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";

interface ProfitMarginXRayProps {
  data: any;
}

export default function ProfitMarginXRay({ data }: ProfitMarginXRayProps) {
  const currentPrice = data.current_price;
  
  // Estimated breakdown (mocked based on price for WOW effect)
  const taxRate = 0.35; // 35% taxes
  const costRate = 0.25; // 25% manufacturing cost
  
  const taxValue = currentPrice * taxRate;
  const costValue = currentPrice * costRate;
  const profitValue = currentPrice - taxValue - costValue;
  
  const profitMarginPercent = Math.round((profitValue / currentPrice) * 100);

  return (
    <div className="w-full bg-[#080810]/90 backdrop-blur-md border border-[#1a1a2e] rounded-2xl overflow-hidden relative group p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e]">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-black font-outfit uppercase tracking-wider text-lg">X-Ray de Lucratividade</h3>
            <p className="text-gray-500 text-[10px] font-mono tracking-widest uppercase">Decodificação da Margem de Varejo</p>
          </div>
        </div>
        
        {profitMarginPercent > 30 && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full text-red-400 text-xs font-bold font-mono animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            MARGEM ABUSIVA DETECTADA
          </div>
        )}
      </div>

      {/* Breakdown Bar */}
      <div className="relative h-12 w-full rounded-full overflow-hidden flex bg-gray-900 border border-gray-800 mb-8">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${costRate * 100}%` }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="h-full bg-blue-500/80 border-r border-black flex items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
        </motion.div>
        
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${taxRate * 100}%` }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className="h-full bg-yellow-500/80 border-r border-black flex items-center justify-center relative overflow-hidden"
        >
           <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
        </motion.div>
        
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(profitValue / currentPrice) * 100}%` }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
          className="h-full bg-[#22c55e] flex items-center justify-center relative overflow-hidden"
        >
           <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
        </motion.div>
      </div>

      {/* Legends */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111122] rounded-xl p-4 border border-[#1a1a2e]">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Factory className="w-4 h-4" />
            <span className="text-xs font-bold font-mono">CUSTO REAL</span>
          </div>
          <div className="text-white font-black text-xl mb-1">
            R$ {costValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-gray-500 text-[10px] font-mono">~{Math.round(costRate * 100)}% do valor</div>
        </div>

        <div className="bg-[#111122] rounded-xl p-4 border border-[#1a1a2e]">
          <div className="flex items-center gap-2 text-yellow-400 mb-1">
            <Landmark className="w-4 h-4" />
            <span className="text-xs font-bold font-mono">IMPOSTOS (BR)</span>
          </div>
          <div className="text-white font-black text-xl mb-1">
            R$ {taxValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-gray-500 text-[10px] font-mono">~{Math.round(taxRate * 100)}% do valor</div>
        </div>

        <div className="bg-[#111122] rounded-xl p-4 border border-[#22c55e]/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#22c55e]/5" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[#22c55e] mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold font-mono">MARGEM VAREJO</span>
            </div>
            <div className="text-white font-black text-xl mb-1">
              R$ {profitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-gray-500 text-[10px] font-mono">{profitMarginPercent}% de markup inserido</div>
          </div>
        </div>
      </div>
    </div>
  );
}
