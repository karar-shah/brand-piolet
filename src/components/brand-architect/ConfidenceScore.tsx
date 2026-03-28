"use client";

import { cn } from "@/lib/utils";

interface ConfidenceScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function ConfidenceScore({ score, size = "md" }: ConfidenceScoreProps) {
  const radius = size === "sm" ? 20 : size === "md" ? 28 : 36;
  const stroke = size === "sm" ? 3 : size === "md" ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const svgSize = (radius + stroke) * 2;

  const getColor = () => {
    if (score >= 85) return { stroke: "#2EC4B6", glow: "rgba(46,196,182,0.3)", text: "text-brand-teal" };
    if (score >= 60) return { stroke: "#D4A853", glow: "rgba(212,168,83,0.3)", text: "text-brand-gold" };
    return { stroke: "#EF4444", glow: "rgba(239,68,68,0.3)", text: "text-red-400" };
  };

  const color = getColor();

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={svgSize}
        height={svgSize}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke="rgba(212,168,83,0.1)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color.glow})` }}
        />
      </svg>
      <span
        className={cn(
          "absolute font-bold tabular-nums",
          color.text,
          size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-lg"
        )}
      >
        {score}
      </span>
    </div>
  );
}
