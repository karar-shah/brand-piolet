"use client";

import { useBrandStore } from "@/stores/useBrandStore";
import { STAGES } from "@/types/brand";
import type { StageId } from "@/types/brand";
import { cn } from "@/lib/utils";
import { Sparkles, Palette, PenTool, Megaphone, Check, AlertCircle } from "lucide-react";

const STAGE_ICONS = {
  Sparkles,
  Palette,
  PenTool,
  Megaphone,
} as const;

export function StageNavigator() {
  const { currentStage, setStage, phases } = useBrandStore();

  return (
    <div className="w-full px-4 sm:px-0">
      <nav className="relative flex items-center justify-between max-w-2xl mx-auto">
        {/* Track line behind the dots */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-brand-gold/10 rounded-full" />

        {/* Progress fill */}
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-linear-to-r from-brand-gold to-brand-teal rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%` }}
        />

        {STAGES.map((stage) => {
          const Icon = STAGE_ICONS[stage.icon as keyof typeof STAGE_ICONS];
          const phase = phases[stage.assetType];
          const isActive = currentStage === stage.id;
          const isAccepted = phase.status === "accepted";
          const isError = phase.status === "error";
          const hasAsset = phase.asset !== null;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setStage(stage.id as StageId)}
              className={cn(
                "relative z-10 flex flex-col items-center gap-2 transition-all duration-300 group cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 rounded-lg p-1"
              )}
            >
              {/* Dot / Icon */}
              <div
                className={cn(
                  "flex items-center justify-center rounded-full transition-all duration-300",
                  isActive
                    ? "h-12 w-12 bg-linear-to-br from-brand-gold to-brand-gold-dark shadow-[0_0_20px_rgba(212,168,83,0.3)] scale-110"
                    : isAccepted
                    ? "h-10 w-10 bg-brand-teal/20 border-2 border-brand-teal"
                    : isError
                    ? "h-10 w-10 bg-red-500/15 border-2 border-red-500/50"
                    : hasAsset
                    ? "h-10 w-10 bg-brand-charcoal border-2 border-brand-gold/30 group-hover:border-brand-gold/60"
                    : "h-10 w-10 bg-brand-charcoal border-2 border-brand-gold/10 group-hover:border-brand-gold/30"
                )}
              >
                {isAccepted ? (
                  <Check className="h-4 w-4 text-brand-teal" />
                ) : isError ? (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                ) : (
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-brand-black" : "text-brand-gold/60 group-hover:text-brand-gold"
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-medium tracking-wide transition-colors whitespace-nowrap",
                  isActive
                    ? "text-brand-gold"
                    : isAccepted
                    ? "text-brand-teal"
                    : "text-muted-foreground/50 group-hover:text-muted-foreground"
                )}
              >
                {stage.label}
              </span>

              {/* Active indicator pulse */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full pulse-ring" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
