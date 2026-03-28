"use client";

import { useBrandStore } from "@/stores/useBrandStore";
import type { AssetType, AttachedContext } from "@/types/brand";
import { STAGES } from "@/types/brand";
import { cn } from "@/lib/utils";
import { Check, X, Link2, MessageSquare, RotateCcw, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";

interface ContextAttachmentProps {
  currentType: AssetType;
  selected: AttachedContext[];
  onToggle: (ctx: AttachedContext) => void;
}

function ContextAttachment({ currentType, selected, onToggle }: ContextAttachmentProps) {
  const { getAcceptedPhases } = useBrandStore();
  const acceptedPhases = getAcceptedPhases().filter((p) => p.type !== currentType);
  const [isOpen, setIsOpen] = useState(false);

  if (acceptedPhases.length === 0) return null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-brand-teal/70 hover:text-brand-teal transition-colors cursor-pointer"
      >
        <Link2 className="h-3.5 w-3.5" />
        <span>Attach context from other phases</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="flex flex-wrap gap-2 animate-card-in">
          {acceptedPhases.map((phase) => {
            const stage = STAGES.find((s) => s.assetType === phase.type);
            const isSelected = selected.some((s) => s.phase === phase.type);

            return (
              <button
                key={phase.type}
                type="button"
                onClick={() => onToggle({ phase: phase.type, content: phase.content })}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                  isSelected
                    ? "border-brand-teal bg-brand-teal/15 text-brand-teal"
                    : "border-brand-gold/10 text-muted-foreground hover:border-brand-teal/30"
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
                {stage?.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface RefinementMenuProps {
  assetType: AssetType;
  initialMode: "improve" | "scratch";
  onClose: () => void;
}

export function RefinementMenu({ assetType, initialMode, onClose }: RefinementMenuProps) {
  const { refineAsset, retryAssetFromScratch } = useBrandStore();
  const [mode, setMode] = useState<"improve" | "scratch">(initialMode);
  const [feedback, setFeedback] = useState("");
  const [phaseConfig, setPhaseConfig] = useState<Record<string, string>>({});
  const [attachedContext, setAttachedContext] = useState<AttachedContext[]>([]);
  const [isWorking, setIsWorking] = useState(false);

  const stage = STAGES.find((s) => s.assetType === assetType);

  const PHASE_CONFIG_OPTIONS: Record<AssetType, { key: string; label: string; options: string[] }[]> = {
    tagline: [
      { key: "style", label: "Style", options: ["Catchy", "Descriptive", "Emotional", "Question-based", "Commanding"] },
      { key: "length", label: "Length", options: ["Short (3-5 words)", "Medium (6-10 words)", "Long (11+ words)"] },
    ],
    visual_concept: [
      { key: "style", label: "Visual Style", options: ["Minimalist", "Bold & Vibrant", "Organic", "Abstract", "Photographic", "Illustrative"] },
      { key: "color_mood", label: "Color Mood", options: ["Warm", "Cool", "Monochrome", "Pastel", "Neon", "Earth Tones"] },
    ],
    logo_concept: [
      { key: "style", label: "Logo Style", options: ["Wordmark", "Lettermark", "Icon-based", "Emblem", "Combination", "Abstract"] },
      { key: "complexity", label: "Complexity", options: ["Ultra-simple", "Moderate detail", "Intricate"] },
    ],
    marketing_content: [
      { key: "format", label: "Format", options: ["Social Media Post", "Email Copy", "Landing Page Hero", "Ad Copy", "Press Release"] },
      { key: "tone", label: "Tone", options: ["Professional", "Casual", "Urgent", "Inspirational", "Humorous"] },
    ],
  };

  const toggleContext = (ctx: AttachedContext) => {
    setAttachedContext((prev) =>
      prev.some((c) => c.phase === ctx.phase)
        ? prev.filter((c) => c.phase !== ctx.phase)
        : [...prev, ctx]
    );
  };

  const handleSubmit = async () => {
    setIsWorking(true);
    try {
      if (mode === "improve") {
        await refineAsset(assetType, feedback, attachedContext.length > 0 ? attachedContext : undefined);
      } else {
        await retryAssetFromScratch(assetType, phaseConfig, attachedContext.length > 0 ? attachedContext : undefined);
      }
      onClose();
    } finally {
      setIsWorking(false);
    }
  };

  const configOptions = PHASE_CONFIG_OPTIONS[assetType] || [];

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-5 animate-card-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-brand-cream flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-gold" />
            Refine {stage?.label}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose how to regenerate this asset
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-brand-gold/10 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-xl border border-brand-gold/10 overflow-hidden">
        <button
          type="button"
          onClick={() => setMode("improve")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all cursor-pointer",
            mode === "improve"
              ? "bg-brand-gold/15 text-brand-gold"
              : "bg-transparent text-muted-foreground hover:text-brand-cream"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Improve Current
        </button>
        <button
          type="button"
          onClick={() => setMode("scratch")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all cursor-pointer",
            mode === "scratch"
              ? "bg-brand-teal/15 text-brand-teal"
              : "bg-transparent text-muted-foreground hover:text-brand-cream"
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start Fresh
        </button>
      </div>

      {/* Improve Mode */}
      {mode === "improve" && (
        <div className="space-y-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What should be different? e.g. 'Make it less techy, more organic and warm.'"
            rows={3}
            className="w-full rounded-xl border border-brand-gold/10 bg-brand-black/50 px-4 py-3 text-sm text-brand-cream placeholder:text-muted-foreground/40 focus:border-brand-gold/30 focus:ring-1 focus:ring-brand-gold/20 focus:outline-none transition-all resize-none"
          />
        </div>
      )}

      {/* Scratch Mode — Phase-specific config */}
      {mode === "scratch" && (
        <div className="space-y-4">
          {configOptions.map((config) => (
            <div key={config.key} className="space-y-2">
              <span className="text-xs font-medium tracking-wider uppercase text-brand-cream-dark/50">
                {config.label}
              </span>
              <div className="flex flex-wrap gap-2">
                {config.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPhaseConfig((prev) => ({ ...prev, [config.key]: opt }))}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                      phaseConfig[config.key] === opt
                        ? "border-brand-teal bg-brand-teal/15 text-brand-teal"
                        : "border-brand-gold/10 text-muted-foreground hover:border-brand-teal/25 hover:text-brand-cream"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Any additional instructions for this fresh take..."
            rows={2}
            className="w-full rounded-xl border border-brand-gold/10 bg-brand-black/50 px-4 py-3 text-sm text-brand-cream placeholder:text-muted-foreground/40 focus:border-brand-gold/30 focus:ring-1 focus:ring-brand-gold/20 focus:outline-none transition-all resize-none"
          />
        </div>
      )}

      {/* Context Attachment */}
      <ContextAttachment
        currentType={assetType}
        selected={attachedContext}
        onToggle={toggleContext}
      />

      {/* Submit */}
      <button
        type="button"
        disabled={isWorking || (mode === "improve" && !feedback.trim())}
        onClick={handleSubmit}
        className={cn(
          "w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition-all duration-300 cursor-pointer",
          !isWorking && (mode === "improve" ? feedback.trim() : true)
            ? mode === "improve"
              ? "bg-linear-to-r from-brand-gold to-brand-gold-light text-brand-black hover:shadow-[0_0_20px_rgba(212,168,83,0.25)]"
              : "bg-linear-to-r from-brand-teal to-brand-teal-light text-brand-black hover:shadow-[0_0_20px_rgba(46,196,182,0.25)]"
            : "bg-brand-charcoal/60 text-muted-foreground cursor-not-allowed"
        )}
      >
        {isWorking ? (
          <>
            <div className="h-4 w-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
            {mode === "improve" ? "Improving..." : "Regenerating..."}
          </>
        ) : mode === "improve" ? (
          <>
            <MessageSquare className="h-4 w-4" />
            Improve This Asset
          </>
        ) : (
          <>
            <RotateCcw className="h-4 w-4" />
            Generate New From Scratch
          </>
        )}
      </button>
    </div>
  );
}
