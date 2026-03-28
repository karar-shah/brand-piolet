"use client";

import { useBrandStore } from "@/stores/useBrandStore";
import { ConfigForm } from "@/components/brand-architect/ConfigForm";
import { StageNavigator } from "@/components/brand-architect/StageNavigator";
import { SwipeDeck } from "@/components/brand-architect/SwipeDeck";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function Home() {
  const { isConfigured, brandContext, resetAll } = useBrandStore();

  // ── Phase 1: Config Form ──
  if (!isConfigured) {
    return <ConfigForm />;
  }

  // ── Phase 2: Workspace (Swipe Deck + Stage Navigator) ──
  return (
    <div className="min-h-screen bg-background bg-particles">
      {/* Decorative gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 -right-60 h-[500px] w-[500px] rounded-full bg-brand-gold/4 blur-[100px]" />
        <div className="absolute -bottom-60 -left-60 h-[500px] w-[500px] rounded-full bg-brand-teal/4 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-brand-black/60 border-b border-brand-gold/8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-gold transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Start Over
          </button>

          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-gold" />
            <span className="text-sm font-semibold text-brand-cream">
              {brandContext?.brand_name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] tracking-wider uppercase text-muted-foreground/50">
              {brandContext?.vibe}
            </span>
          </div>
        </div>
      </header>

      {/* Stage Navigator */}
      <div className="py-6 sm:py-8">
        <StageNavigator />
      </div>

      {/* Swipe Deck */}
      <main className="max-w-xl mx-auto px-4 sm:px-6 pb-12">
        <SwipeDeck />
      </main>
    </div>
  );
}
