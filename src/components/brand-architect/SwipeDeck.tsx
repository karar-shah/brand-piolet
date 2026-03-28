"use client";

import { useState } from "react";
import { useBrandStore } from "@/stores/useBrandStore";
import { STAGES } from "@/types/brand";
import type { StageId } from "@/types/brand";
import { ConfidenceScore } from "./ConfidenceScore";
import { RefinementMenu } from "./RefinementMenu";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { FinalReview } from "./FinalReview";
import {
  ThumbsUp,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Palette,
  PenTool,
  Megaphone,
  Zap,
  Copy,
  Check,
  MessageSquare,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STAGE_ICONS = {
  Sparkles,
  Palette,
  PenTool,
  Megaphone,
} as const;

export function SwipeDeck() {
  const { currentStage, phases, acceptAsset, generatePhaseAsset, setStage, setAssetIndex } = useBrandStore();
  const stage = STAGES[currentStage];
  const phase = phases[stage.assetType];
  const Icon = STAGE_ICONS[stage.icon as keyof typeof STAGE_ICONS];

  const [refinementMode, setRefinementMode] = useState<"improve" | "scratch" | false>(false);
  const [copied, setCopied] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  if (showFinal) {
    return <FinalReview onBack={() => setShowFinal(false)} />;
  }

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNextPhase = () => {
    if (currentStage < STAGES.length - 1) {
      const nextId = (currentStage + 1) as StageId;
      setStage(nextId);
      const nextStage = STAGES[nextId];
      if ((!phases[nextStage.assetType].assets || phases[nextStage.assetType].assets.length === 0) && phases[nextStage.assetType].status !== "loading") {
        generatePhaseAsset(nextStage.assetType);
      }
    }
  };

  const hasAssets = phase.assets && phase.assets.length > 0;
  const activeAsset = hasAssets ? phase.assets[phase.currentIndex] : null;

  const handlePrevOption = () => {
    if (phase.currentIndex > 0) {
      setAssetIndex(stage.assetType, phase.currentIndex - 1);
    }
  };

  const handleNextOption = () => {
    if (phase.currentIndex < phase.assets.length - 1) {
      setAssetIndex(stage.assetType, phase.currentIndex + 1);
    }
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
            onClick={() => generatePhaseAsset(stage.assetType)}
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
  if (!activeAsset) {
    return (
      <div className="glass-card rounded-2xl p-6 sm:p-8 text-center space-y-4 animate-card-in">
        <div className="h-16 w-16 mx-auto rounded-full bg-brand-gold/10 flex items-center justify-center">
          <Icon className="h-8 w-8 text-brand-gold/50" />
        </div>
        <p className="text-muted-foreground text-sm">
          No generated options for this stage yet.
        </p>
      </div>
    );
  }

  // ── Refinement mode ──
  if (refinementMode) {
    return (
      <RefinementMenu
        assetType={stage.assetType}
        initialMode={refinementMode}
        onClose={() => setRefinementMode(false)}
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
          <ConfidenceScore score={activeAsset.confidence_score} />
        </div>

        {/* Content */}
        <div className="relative rounded-xl bg-brand-teal/5 border border-brand-teal/10 p-5 group">
          <p className="text-sm text-brand-cream/90 leading-relaxed whitespace-pre-wrap pr-8">
            {activeAsset.content}
          </p>
          <button
            onClick={() => handleCopy(activeAsset.content)}
            className="absolute top-4 right-4 text-brand-teal/50 hover:text-brand-teal transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        {/* Edit option */}
        <button
          type="button"
          onClick={() => setRefinementMode("improve")}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-brand-gold transition-colors mx-auto cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Change your mind? Refine this choice
        </button>

        {/* Move to Next Phase Button or Final Review */}
        <div className="pt-4 border-t border-brand-teal/10 mt-6">
          {currentStage < STAGES.length - 1 ? (
            <button
              onClick={handleNextPhase}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-linear-to-r from-brand-teal to-brand-teal-light text-brand-black hover:shadow-[0_0_30px_rgba(46,196,182,0.25)] hover:scale-[1.01] cursor-pointer"
            >
              Move to Next Phase
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowFinal(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-linear-to-r from-brand-gold to-brand-gold-dark text-brand-black hover:shadow-[0_0_30px_rgba(212,168,83,0.25)] hover:scale-[1.01] cursor-pointer"
            >
              View Final Summary
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Active card (3 buttons + pagination) ──
  return (
    <div className="space-y-5 animate-card-in">
      {/* The Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-5 overflow-hidden">
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
          <ConfidenceScore score={activeAsset.confidence_score} size="lg" />
        </div>

        {/* AI Acknowledgement (if from refinement) */}
        {activeAsset.ai_acknowledgement && (
          <div className="flex items-start gap-2 rounded-lg bg-brand-teal/5 border border-brand-teal/10 px-4 py-2.5">
            <Zap className="h-3.5 w-3.5 text-brand-teal mt-0.5 shrink-0" />
            <p className="text-xs text-brand-teal/80 leading-relaxed">
              {activeAsset.ai_acknowledgement}
            </p>
          </div>
        )}

        {/* Content area with side arrows for swiping */}
        <div className="relative flex items-center gap-3">
          <button
            type="button"
            disabled={phase.currentIndex === 0}
            onClick={handlePrevOption}
            className="shrink-0 p-2 rounded-full cursor-pointer hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-brand-cream/70" />
          </button>
          
          <div className="flex-1 relative rounded-xl bg-brand-black/30 border border-brand-gold/8 p-5 min-h-[120px] group transition-all duration-300">
            <p className="text-sm sm:text-base text-brand-cream/90 leading-relaxed whitespace-pre-wrap pr-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeAsset.content}
            </p>
            <button
              onClick={() => handleCopy(activeAsset.content)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-brand-cream transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-brand-teal" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="button"
            disabled={phase.currentIndex === phase.assets.length - 1}
            onClick={handleNextOption}
            className="shrink-0 p-2 rounded-full cursor-pointer hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-brand-cream/70" />
          </button>
        </div>

        {/* Swipe Indicators */}
        <div className="flex justify-center items-center gap-2 pt-2">
           {phase.assets.map((_, i) => (
             <button
               key={i}
               onClick={() => setAssetIndex(stage.assetType, i)}
               className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === phase.currentIndex ? "w-6 bg-brand-gold" : "w-1.5 bg-brand-gold/20 hover:bg-brand-gold/40"}`}
             />
           ))}
        </div>

        {/* Confidence label */}
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3 text-brand-gold/40" />
          <span className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground/40">
            Option {phase.currentIndex + 1} of {phase.assets.length} • AI Confidence: {activeAsset.confidence_score}%
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setRefinementMode("scratch")}
          className="flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 border border-brand-gold/10 bg-brand-charcoal hover:border-brand-gold/30 hover:bg-brand-gold/5 text-muted-foreground hover:text-brand-cream cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start Fresh
        </button>

        <button
          type="button"
          onClick={() => setRefinementMode("improve")}
          className="flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 border border-brand-teal/20 bg-brand-teal/5 text-brand-teal hover:bg-brand-teal/15 hover:shadow-[0_0_15px_rgba(46,196,182,0.15)] cursor-pointer"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Improve Current
        </button>

        <button
          type="button"
          onClick={() => acceptAsset(stage.assetType)}
          className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 bg-linear-to-r from-brand-teal to-brand-teal-light text-brand-black hover:shadow-[0_0_20px_rgba(46,196,182,0.25)] hover:scale-[1.01] cursor-pointer"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Accept Option {phase.currentIndex + 1}
        </button>
      </div>
    </div>
  );
}
