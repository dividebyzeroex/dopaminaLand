"use client";

import { motion } from "framer-motion";

interface KineticTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function KineticTextReveal({ text, className = "", delay = 0 }: KineticTextRevealProps) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay * i },
    }),
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      rotateX: -45,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-wrap justify-center ${className}`}
    >
      {words.map((word, index) => (
        <motion.span
          variants={childVariants}
          key={index}
          className="inline-block mr-[0.25em] whitespace-nowrap"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
