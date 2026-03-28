"use client";

import { useState, useRef, useCallback } from "react";
import { useBrandStore } from "@/stores/useBrandStore";
import { STAGES } from "@/types/brand";
import { cn } from "@/lib/utils";
import { ConfidenceScore } from "./ConfidenceScore";
import { RefinementMenu } from "./RefinementMenu";
import { LoadingSkeleton } from "./LoadingSkeleton";
import {
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Palette,
  PenTool,
  Megaphone,
  Zap,
} from "lucide-react";

const STAGE_ICONS = {
  Sparkles,
  Palette,
  PenTool,
  Megaphone,
} as const;

export function SwipeDeck() {
  const { currentStage, phases, acceptAsset, fetchInitialAssets } = useBrandStore();
  const stage = STAGES[currentStage];
  const phase = phases[stage.assetType];
  const Icon = STAGE_ICONS[stage.icon as keyof typeof STAGE_ICONS];

  const [isRefining, setIsRefining] = useState(false);
  const [swipeAnim, setSwipeAnim] = useState<"left" | "right" | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // ── Touch / Swipe handling (mobile) ──
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    if (cardRef.current) {
      const rotation = touchDeltaX.current * 0.05;
      cardRef.current.style.transform = `translateX(${touchDeltaX.current}px) rotate(${rotation}deg)`;
      cardRef.current.style.transition = "none";
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.3s ease";
      if (Math.abs(touchDeltaX.current) > 100) {
        if (touchDeltaX.current > 0) {
          handleAccept();
        } else {
          handleReject();
        }
      } else {
        cardRef.current.style.transform = "";
      }
    }
  }, []);

  const handleAccept = () => {
    setSwipeAnim("right");
    setTimeout(() => {
      acceptAsset(stage.assetType);
      setSwipeAnim(null);
    }, 400);
  };

  const handleReject = () => {
    setSwipeAnim("left");
    setTimeout(() => {
      setSwipeAnim(null);
      setIsRefining(true);
    }, 400);
  };

  // ── Loading state ──
  if (phase.status === "loading") {
    return <LoadingSkeleton />;
  }

  // ── Error state ──
  if (phase.status === "error") {
    return (
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-5 animate-card-in text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-red-500/15 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-cream mb-1">Generation Failed</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {phase.error || "Something went wrong. Your input has been preserved."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchInitialAssets()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-gold/15 text-brand-gold text-sm font-medium hover:bg-brand-gold/25 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Generation
          </button>
        </div>
      </div>
    );
  }

  // ── No asset yet ──
  if (!phase.asset) {
    return (
      <div className="glass-card rounded-2xl p-6 sm:p-8 text-center space-y-4 animate-card-in">
        <div className="h-16 w-16 mx-auto rounded-full bg-brand-gold/10 flex items-center justify-center">
          <Icon className="h-8 w-8 text-brand-gold/50" />
        </div>
        <p className="text-muted-foreground text-sm">
          No asset generated for this stage yet.
        </p>
      </div>
    );
  }

  // ── Refinement mode ──
  if (isRefining) {
    return (
      <RefinementMenu
        assetType={stage.assetType}
        onClose={() => setIsRefining(false)}
      />
    );
  }

  // ── Accepted state ──
  if (phase.status === "accepted") {
    return (
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-5 animate-card-in border-brand-teal/20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-teal/15 flex items-center justify-center">
              <Icon className="h-5 w-5 text-brand-teal" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-brand-cream">{stage.label}</h3>
              <p className="text-xs text-brand-teal flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                Accepted
              </p>
            </div>
          </div>
          <ConfidenceScore score={phase.asset.confidence_score} />
        </div>

        {/* Content */}
        <div className="rounded-xl bg-brand-teal/5 border border-brand-teal/10 p-5">
          <p className="text-sm text-brand-cream/90 leading-relaxed whitespace-pre-wrap">
            {phase.asset.content}
          </p>
        </div>

        {/* Edit option */}
        <button
          type="button"
          onClick={() => setIsRefining(true)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-brand-gold transition-colors mx-auto cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Change your mind? Refine this asset
        </button>
      </div>
    );
  }

  // ── Active card (swipeable) ──
  return (
    <div className="space-y-5">
      {/* The Card */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "glass-card rounded-2xl p-6 sm:p-8 space-y-5 touch-pan-y select-none",
          swipeAnim === "left" && "animate-swipe-left",
          swipeAnim === "right" && "animate-swipe-right",
          !swipeAnim && "animate-card-in"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-brand-cream">{stage.label}</h3>
              <p className="text-xs text-muted-foreground">{stage.description}</p>
            </div>
          </div>
          <ConfidenceScore score={phase.asset.confidence_score} size="lg" />
        </div>

        {/* AI Acknowledgement (if from refinement) */}
        {phase.asset.ai_acknowledgement && (
          <div className="flex items-start gap-2 rounded-lg bg-brand-teal/5 border border-brand-teal/10 px-4 py-2.5">
            <Zap className="h-3.5 w-3.5 text-brand-teal mt-0.5 shrink-0" />
            <p className="text-xs text-brand-teal/80 leading-relaxed">
              {phase.asset.ai_acknowledgement}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="rounded-xl bg-brand-black/30 border border-brand-gold/8 p-5 min-h-[120px]">
          <p className="text-sm sm:text-base text-brand-cream/90 leading-relaxed whitespace-pre-wrap">
            {phase.asset.content}
          </p>
        </div>

        {/* Confidence label */}
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3 text-brand-gold/40" />
          <span className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground/40">
            AI Confidence: {phase.asset.confidence_score}%
          </span>
        </div>
      </div>

      {/* Desktop Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleReject}
          disabled={!!swipeAnim}
          className={cn(
            "flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 group cursor-pointer",
            "border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          )}
        >
          <ThumbsDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
          Reject & Refine
        </button>

        <button
          type="button"
          onClick={handleAccept}
          disabled={!!swipeAnim}
          className={cn(
            "flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 group cursor-pointer",
            "bg-gradient-to-r from-brand-teal to-brand-teal-light text-brand-black hover:shadow-[0_0_30px_rgba(46,196,182,0.25)] hover:scale-[1.01]"
          )}
        >
          <ThumbsUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
          Accept
        </button>
      </div>

      {/* Mobile swipe hint */}
      <p className="text-center text-[10px] text-muted-foreground/30 sm:hidden">
        Swipe right to accept · Swipe left to refine
      </p>
    </div>
  );
}
