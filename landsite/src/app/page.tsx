'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden px-6 py-6 md:px-12 md:py-8 select-none">
      
      {/* ============ HEADER / NAVIGATION ============ */}
      <header className="relative z-30 flex w-full justify-between items-center max-w-7xl mx-auto">
        {/* Sleek stylized white bird logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <svg
            viewBox="0 0 100 100"
            className="h-8 w-8 text-[#1c2b36] fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 40 C 30 35, 45 42, 60 30 C 70 20, 85 10, 95 15 C 90 25, 80 35, 70 42 C 60 50, 40 55, 30 65 C 20 75, 15 85, 10 90 C 12 75, 18 60, 15 50 Z" />
          </svg>
        </div>

        {/* Navigation pill link capsule */}
        <nav className="hidden lg:flex items-center gap-1 border border-white/50 bg-white/20 backdrop-blur-md px-2 py-1.5 rounded-full shadow-sm">
          <a
            href="#home"
            className="text-[11px] font-bold text-[#1c2b36] bg-white/40 border border-white/40 px-4 py-1.5 rounded-full"
          >
            home
          </a>
          <a
            href="#about"
            className="text-[11px] font-bold text-[#1c2b36]/60 hover:text-[#1c2b36] px-4 py-1.5 rounded-full transition-colors"
          >
            about
          </a>
          <a
            href="#services"
            className="text-[11px] font-bold text-[#1c2b36]/60 hover:text-[#1c2b36] px-4 py-1.5 rounded-full transition-colors"
          >
            services
          </a>
          <a
            href="#industries"
            className="text-[11px] font-bold text-[#1c2b36]/60 hover:text-[#1c2b36] px-4 py-1.5 rounded-full transition-colors"
          >
            industries
          </a>
          <a
            href="#threat"
            className="text-[11px] font-bold text-[#1c2b36]/60 hover:text-[#1c2b36] px-4 py-1.5 rounded-full transition-colors"
          >
            threat intelligence
          </a>
          <a
            href="#contact"
            className="text-[11px] font-bold text-[#1c2b36]/60 hover:text-[#1c2b36] px-4 py-1.5 rounded-full transition-colors"
          >
            contact
          </a>
        </nav>

        {/* Resources capsule button */}
        <button className="bg-white border border-[#1c2b36]/5 text-[#1c2b36] px-6 py-2.5 rounded-full text-xs font-black hover:bg-white/80 transition shadow-sm">
          Resources
        </button>
      </header>

      {/* ============ CENTERPIECE 3D OVERLAY BACKGROUND ============ */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        {/* Giant low-opacity background serif text */}
        <span className="absolute text-[16vw] font-black text-white/50 tracking-[0.05em] font-serif uppercase select-none z-0">
          DATA INTENT
        </span>

        {/* Blue bird hero centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative h-[55vh] w-[55vh] flex items-center justify-center z-10"
        >
          {/* Radial blur container to seamlessly merge background colors */}
          <div className="absolute inset-10 rounded-full bg-cyan-100/40 blur-[40px] -z-10" />
          <img
            src="/hero_bird.png"
            alt="Blue Bird Hero"
            className="h-full w-full object-contain rounded-full mix-blend-multiply"
          />
        </motion.div>
      </div>

      {/* ============ MAIN LAYOUT CONTAINER ============ */}
      <main className="relative z-20 mx-auto w-full max-w-7xl flex-1 flex flex-col justify-between pt-12 md:pt-16 pb-6">
        
        {/* TOP ROW: HEADLINE (LEFT) & SOCIAL PROOF (RIGHT) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 w-full">
          {/* Left: Innovation & Security */}
          <div className="max-w-xl text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[0.98] font-[family-name:var(--font-host-grotesk)] drop-shadow-sm">
              Innovation
              <br />
              <span className="font-serif italic font-normal text-white/90 mr-2">&</span>
              security
            </h1>
            <p className="text-sm md:text-base text-[#1c2b36]/60 font-semibold mt-6 max-w-md">
              We are at the forefront of merging cutting-edge technology.
            </p>
            
            <div className="flex items-center gap-3 mt-8">
              <button className="group flex items-center gap-3 rounded-full bg-[#0088ff] pl-6 pr-2 py-2 text-xs font-bold text-white shadow-md hover:bg-[#0077ee] transition">
                Our Solutions
                <span className="rounded-full bg-white p-2 text-[#0088ff] transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
              <button className="rounded-full border border-[#1c2b36]/15 bg-transparent px-6 py-3.5 text-xs font-bold text-[#1c2b36] hover:bg-white/20 transition">
                Contact us
              </button>
            </div>
          </div>

          {/* Right: Social Proof Fluter */}
          <div className="flex items-center gap-3 border border-white/60 bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-full shadow-sm self-end lg:self-center">
            <div className="flex -space-x-2">
              <img src="/api/placeholder/40/40" alt="User 1" className="h-6 w-6 rounded-full border border-white object-cover" />
              <img src="/api/placeholder/40/40" alt="User 2" className="h-6 w-6 rounded-full border border-white object-cover" />
              <img src="/api/placeholder/40/40" alt="User 3" className="h-6 w-6 rounded-full border border-white object-cover" />
              <img src="/api/placeholder/40/40" alt="User 4" className="h-6 w-6 rounded-full border border-white object-cover" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1c2b36]">
              Active Users <span className="text-[#0088ff] font-extrabold">+323</span>
            </span>
          </div>
        </div>

        {/* BOTTOM ROW: BENTO GRID FLOATING PANEL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
          
          {/* Card 1: Perfect Security (Glassmorphic Dark) */}
          <div className="glass-panel-dark rounded-[2rem] p-6 flex items-center gap-6 relative group cursor-pointer hover:border-[#1c2b36]/20 transition-all duration-300">
            <div className="h-20 w-20 flex-shrink-0 flex items-center justify-center">
              <img src="/padlock_3d.png" alt="3D Padlock" className="h-full w-full object-contain" />
            </div>
            <div className="flex-1 text-left">
              <span className="inline-block bg-[#1c2b36]/10 px-3 py-1 rounded-full text-[9px] font-black uppercase text-[#1c2b36]/60">
                Perfect Security
              </span>
              <h3 className="text-sm font-bold text-[#1c2b36] mt-2 leading-snug">
                AI ensures total protection
              </h3>
            </div>
            <div className="absolute top-5 right-5 text-[#1c2b36]/30 group-hover:text-[#1c2b36] transition-colors">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>

          {/* Card 2: Integrated AI Agent (White Organic Card) */}
          <div className="organic-card p-6 flex flex-col justify-between relative group cursor-pointer hover:shadow-lg transition-all duration-300">
            <div className="absolute top-5 right-5 text-[#1c2b36]/30 group-hover:text-[#1c2b36] transition-colors">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div className="h-16 w-16 flex items-center justify-center">
              <img src="/swirl_3d.png" alt="3D Swirl" className="h-full w-full object-contain" />
            </div>
            <div className="text-left mt-6">
              <h3 className="text-base font-black text-[#1c2b36] leading-none">
                Integrated AI Agent
              </h3>
              <p className="text-[10px] text-[#1c2b36]/50 font-bold mt-2 leading-relaxed">
                Integrated AI agent for personalized client experiences.
              </p>
            </div>
          </div>

          {/* Card 3: 42% Statistics (Glassmorphic Light) */}
          <div className="glass-panel rounded-[2rem] p-6 flex flex-col justify-between relative group cursor-pointer hover:border-[#1c2b36]/20 transition-all duration-300">
            <div className="absolute top-5 right-5 text-[#1c2b36]/30 group-hover:text-[#1c2b36] transition-colors">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div className="text-left">
              <span className="font-serif text-5xl font-black text-[#1c2b36]">
                42%
              </span>
            </div>
            <div className="text-left mt-6">
              <p className="text-[10px] text-[#1c2b36]/60 font-semibold leading-relaxed">
                Join us in redefining the future of security with innovative solutions
              </p>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
