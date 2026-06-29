import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "../utils/cn";

interface CardProps extends HTMLMotionProps<"div"> {
  /** Use the slightly warmer raised surface for highlighted panels. */
  raised?: boolean;
}

export function Card({ className, children, raised, ...props }: CardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-[var(--radius)] border border-line p-6",
        raised ? "bg-paper-raised" : "bg-paper",
        "shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_1px_2px_rgba(44,33,24,0.04),0_10px_30px_-16px_rgba(44,33,24,0.22)]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
