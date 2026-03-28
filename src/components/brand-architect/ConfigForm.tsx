"use client";

import { useState } from "react";
import { useBrandStore } from "@/stores/useBrandStore";
import type { BrandContext } from "@/types/brand";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight, Building2, Users, Wand2, FileText } from "lucide-react";

const VIBE_OPTIONS = [
  "Playful & Modern",
  "Bold & Edgy",
  "Elegant & Luxurious",
  "Minimalist & Clean",
  "Warm & Organic",
  "Tech & Futuristic",
  "Retro & Nostalgic",
  "Professional & Corporate",
];

const INDUSTRY_OPTIONS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "Food & Beverage",
  "Fashion",
  "Real Estate",
  "Entertainment",
  "Non-profit",
  "SaaS",
  "Pet Tech",
];

const AUDIENCE_OPTIONS = [
  "Gen Z",
  "Millennials",
  "Gen X",
  "Baby Boomers",
  "B2B Professionals",
  "Small Business Owners",
  "Students",
  "Parents",
  "Creatives",
  "Developers",
];

export function ConfigForm() {
  const { setBrandContext, generatePhaseAsset } = useBrandStore();

  const [form, setForm] = useState<Partial<BrandContext>>({
    brand_name: "",
    description: "",
    industry: "",
    vibe: "",
    target_audience: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (key: keyof BrandContext, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isValid =
    form.brand_name?.trim() &&
    form.description?.trim() &&
    form.industry &&
    form.vibe &&
    form.target_audience;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setBrandContext(form as BrandContext);
    await generatePhaseAsset("tagline");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-particles">
      {/* Decorative background circles */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand-teal/5 blur-3xl" />
      </div>

      <div className="w-full max-w-2xl animate-card-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/20 bg-brand-gold/5 mb-6">
            <Sparkles className="h-4 w-4 text-brand-gold" />
            <span className="text-xs font-medium tracking-wider uppercase text-brand-gold">
              AI Brand Architect
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="gold-shimmer">Craft Your Brand</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Describe your business and let AI generate taglines, visuals, logos, and marketing
            content tailored to your vision.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-7">
          {/* Brand Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-brand-cream-dark/60">
              <Building2 className="h-3.5 w-3.5" />
              Brand Name
            </label>
            <input
              type="text"
              value={form.brand_name || ""}
              onChange={(e) => updateField("brand_name", e.target.value)}
              placeholder="e.g. Urban Paws"
              className="w-full rounded-xl border border-brand-gold/10 bg-brand-black/50 px-4 py-3 text-sm text-brand-cream placeholder:text-muted-foreground/50 focus:border-brand-gold/30 focus:ring-1 focus:ring-brand-gold/20 focus:outline-none transition-all"
            />
          </div>

          {/* Business Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-brand-cream-dark/60">
              <FileText className="h-3.5 w-3.5" />
              Business Description
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe your business, products, and what makes you unique..."
              rows={4}
              className="w-full rounded-xl border border-brand-gold/10 bg-brand-black/50 px-4 py-3 text-sm text-brand-cream placeholder:text-muted-foreground/50 focus:border-brand-gold/30 focus:ring-1 focus:ring-brand-gold/20 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-brand-cream-dark/60">
              <Building2 className="h-3.5 w-3.5" />
              Industry
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateField("industry", opt)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                    form.industry === opt
                      ? "border-brand-gold bg-brand-gold/15 text-brand-gold shadow-[0_0_12px_rgba(212,168,83,0.15)]"
                      : "border-brand-gold/10 bg-transparent text-muted-foreground hover:border-brand-gold/25 hover:text-brand-cream"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Vibe */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-brand-cream-dark/60">
              <Wand2 className="h-3.5 w-3.5" />
              Brand Vibe
            </label>
            <div className="flex flex-wrap gap-2">
              {VIBE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateField("vibe", opt)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                    form.vibe === opt
                      ? "border-brand-teal bg-brand-teal/15 text-brand-teal shadow-[0_0_12px_rgba(46,196,182,0.15)]"
                      : "border-brand-gold/10 bg-transparent text-muted-foreground hover:border-brand-teal/25 hover:text-brand-cream"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-brand-cream-dark/60">
              <Users className="h-3.5 w-3.5" />
              Target Audience
            </label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateField("target_audience", opt)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                    form.target_audience === opt
                      ? "border-brand-gold bg-brand-gold/15 text-brand-gold shadow-[0_0_12px_rgba(212,168,83,0.15)]"
                      : "border-brand-gold/10 bg-transparent text-muted-foreground hover:border-brand-gold/25 hover:text-brand-cream"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
            className={cn(
              "w-full flex items-center justify-center gap-3 rounded-xl py-3.5 font-semibold text-sm transition-all duration-300",
              isValid && !isSubmitting
                ? "bg-linear-to-r from-brand-gold to-brand-gold-light text-brand-black hover:shadow-[0_0_30px_rgba(212,168,83,0.3)] hover:scale-[1.01] cursor-pointer"
                : "bg-brand-charcoal/60 text-muted-foreground cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
                Generating brand assets...
              </>
            ) : (
              <>
                Generate Brand Assets
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          You&apos;ll be able to review, accept, reject, or refine each asset individually.
        </p>
      </div>
    </div>
  );
}
