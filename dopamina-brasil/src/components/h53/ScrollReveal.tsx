"use client";

import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export default function ScrollReveal({ children, width = "fit-content", delay = 0, direction = "up" }: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  const getVariants = () => {
    const hidden = {
      up: { opacity: 0, y: 75 },
      down: { opacity: 0, y: -75 },
      left: { opacity: 0, x: 75 },
      right: { opacity: 0, x: -75 },
    };
    return {
      hidden: hidden[direction],
      visible: { opacity: 1, y: 0, x: 0 },
    };
  };

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={getVariants()}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} // smooth awwwards easing
      >
        {children}
      </motion.div>
    </div>
  );
}
