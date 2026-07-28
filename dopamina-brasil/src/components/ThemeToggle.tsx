"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Zap } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "cyberpunk-light">("dark");

  useEffect(() => {
    // Read from localStorage on mount
    const saved = localStorage.getItem("dopamina-theme") as "dark" | "cyberpunk-light";
    if (saved === "cyberpunk-light") {
      setTheme("cyberpunk-light");
      document.documentElement.classList.add("cyberpunk-light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "cyberpunk-light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("dopamina-theme", newTheme);
    
    if (newTheme === "cyberpunk-light") {
      document.documentElement.classList.add("cyberpunk-light");
    } else {
      document.documentElement.classList.remove("cyberpunk-light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-[100] bg-[#111122]/90 backdrop-blur-md border border-cyan-500/30 p-3 rounded-full text-cyan-400 hover:text-cyan-300 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 group no-invert"
      title="Alternar Tema Cibernético"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      
      {/* Tooltip on hover */}
      <span className="absolute right-full mr-4 bg-[#111122] border border-cyan-500/50 px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 pointer-events-none">
        {theme === "dark" ? "Ativar Modo Cyberpunk Claro" : "Voltar para Dark Mode"}
      </span>
    </button>
  );
}
