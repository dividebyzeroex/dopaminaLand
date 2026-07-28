"use client";

import React, { useState, useEffect } from "react";
import SuperSearchHero from "@/components/SuperSearchHero";
import MobileAppShell from "@/components/mobile/MobileAppShell";

export default function HomePageClient() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return <MobileAppShell />;
  }

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-gradient-to-b from-[#0a192f] via-[#050508] to-[#050508] overflow-hidden">
      {/* Super Search Hero Section takes full height */}
      <section className="flex-1 w-full h-full flex items-center justify-center relative">
        <SuperSearchHero />
      </section>
    </div>
  );
}
