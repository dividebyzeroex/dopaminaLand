"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export default function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const [mounted, setMounted] = useState(false);
  
  // Spring config for a smooth odometer/slot machine effect
  const springValue = useSpring(0, {
    stiffness: 60,
    damping: 20,
    mass: 1,
  });

  useEffect(() => {
    setMounted(true);
    // Slight delay to make the animation noticeable after page transition
    const timeout = setTimeout(() => {
      springValue.set(value);
    }, 200);
    return () => clearTimeout(timeout);
  }, [value, springValue]);

  const display = useTransform(springValue, (current) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(current);
  });

  if (!mounted) {
    return (
      <span className={className}>
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
        }).format(0)}
      </span>
    );
  }

  return <motion.span className={className}>{display}</motion.span>;
}
