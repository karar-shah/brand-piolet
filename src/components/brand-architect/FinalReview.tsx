"use client";

import { useBrandStore } from "@/stores/useBrandStore";
import { STAGES } from "@/types/brand";
import { ConfidenceScore } from "./ConfidenceScore";
import { Copy, Check, ArrowLeft, Sparkles } from "lucide-react";
import { useState } from "react";

export function FinalReview({ onBack }: { onBack: () => void }) {
  const { phases, brandContext } = useBrandStore();
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedStage, setCopiedStage] = useState<string | null>(null);

  const handleCopySingle = async (content: string, stageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStage(stageId);
      setTimeout(() => setCopiedStage(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleCopyAll = async () => {
    try {
      let textToCopy = `Brand Concept: ${brandContext?.brand_name}\n\n`;
      
      STAGES.forEach((stage) => {
        const phase = phases[stage.assetType];
        if (phase.status === "accepted" && phase.assets.length > 0) {
          textToCopy += `[${stage.label.toUpperCase()}]\n${phase.assets[phase.currentIndex].content}\n\n`;
        }
      });

      await navigator.clipboard.writeText(textToCopy);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error("Failed to copy all", err);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border-brand-gold/20">
        
        {/* Header */}
        <div className="flex flex-col gap-4">
          <button
            onClick={onBack}
            className="self-start flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-cream transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Editor
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-brand-cream flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-gold" />
                Final Brand Package
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Here are your fully generated and accepted brand assets.
              </p>
            </div>
            
            <button
              onClick={handleCopyAll}
              className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-medium text-sm transition-all duration-300 bg-brand-teal/15 text-brand-teal hover:bg-brand-teal/25 border border-brand-teal/20 cursor-pointer w-full sm:w-auto shrink-0"
            >
              {copiedAll ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedAll ? "Copied All" : "Copy Everything"}
            </button>
          </div>
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-brand-gold/15 to-transparent my-2" />

        {/* Content Details */}
        <div className="space-y-8">
          {STAGES.map((stage) => {
            const phase = phases[stage.assetType];
            const isAccepted = phase.status === "accepted" && phase.assets.length > 0;
            if (!isAccepted) return null;
            
            const activeAsset = phase.assets[phase.currentIndex];

            return (
              <div key={stage.id} className="space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold tracking-wide text-brand-gold/80 uppercase">
                    {stage.label}
                  </h3>
                  <ConfidenceScore score={activeAsset.confidence_score} />
                </div>
                
                <div className="relative rounded-xl bg-brand-black/30 border border-brand-gold/5 p-4 sm:p-5 transition-colors group-hover:border-brand-gold/15">
                  <p className="text-sm text-brand-cream/90 leading-relaxed whitespace-pre-wrap pr-8">
                    {activeAsset.content}
                  </p>
                  
                  <button
                    onClick={() => handleCopySingle(activeAsset.content, String(stage.id))}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-brand-teal transition-colors cursor-pointer p-1"
                    title="Copy section"
                  >
                    {copiedStage === String(stage.id) ? (
                      <Check className="h-4 w-4 text-brand-teal" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
