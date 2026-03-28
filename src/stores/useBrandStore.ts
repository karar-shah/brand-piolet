"use client";

import { create } from "zustand";
import type {
  BrandContext,
  AssetType,
  PhaseState,
  StageId,
  BrandAsset,
  AttachedContext,
} from "@/types/brand";
import { STAGES } from "@/types/brand";

// ─── Mock Data (used while backend is unavailable) ──────────────────

const MOCK_ASSETS: Record<AssetType, BrandAsset> = {
  tagline: {
    id: "mock-1",
    type: "tagline",
    content: "Pawsitively Connected — Where every wag meets innovation.",
    confidence_score: 88,
  },
  visual_concept: {
    id: "mock-2",
    type: "visual_concept",
    content:
      "A vibrant gradient background transitioning from warm coral to deep indigo, with floating geometric shapes that subtly form a paw print constellation. Typography uses a bold sans-serif in cream white.",
    confidence_score: 75,
  },
  logo_concept: {
    id: "mock-3",
    type: "logo_concept",
    content:
      "A minimalist wireframe of a dog bone morphing into a smartphone silhouette, rendered in neon teal on a charcoal background. Clean lines with rounded corners suggest approachability.",
    confidence_score: 82,
  },
  marketing_content: {
    id: "mock-4",
    type: "marketing_content",
    content:
      "🐾 Meet your pet's new best friend. Urban Paws brings smart tech to the world's most loyal companions. Track their health, connect with local pet communities, and discover curated products — all in one app. Download now and join 50,000+ happy pet parents.",
    confidence_score: 91,
  },
};

// ─── Store Shape ────────────────────────────────────────────────────

interface BrandStore {
  // ── Global ──
  brandContext: BrandContext | null;
  currentStage: StageId;
  isConfigured: boolean; // has the user submitted the config form?

  // ── Per-phase state ──
  phases: Record<AssetType, PhaseState>;

  // ── Actions: Config ──
  setBrandContext: (ctx: BrandContext) => void;
  resetAll: () => void;

  // ── Actions: Navigation ──
  setStage: (stage: StageId) => void;

  // ── Actions: Asset lifecycle ──
  fetchInitialAssets: () => Promise<void>;
  acceptAsset: (type: AssetType) => void;
  refineAsset: (
    type: AssetType,
    feedback: string,
    attachedContext?: AttachedContext[]
  ) => Promise<void>;
  retryAssetFromScratch: (
    type: AssetType,
    phaseConfig: Record<string, string>,
    attachedContext?: AttachedContext[]
  ) => Promise<void>;

  // ── Helpers ──
  getPhase: (type: AssetType) => PhaseState;
  getAcceptedPhases: () => { type: AssetType; content: string }[];
}

const defaultPhaseState: PhaseState = {
  asset: null,
  status: "pending",
  error: null,
  phaseConfig: {},
};

const createDefaultPhases = (): Record<AssetType, PhaseState> => ({
  tagline: { ...defaultPhaseState },
  visual_concept: { ...defaultPhaseState },
  logo_concept: { ...defaultPhaseState },
  marketing_content: { ...defaultPhaseState },
});

// ─── Store ──────────────────────────────────────────────────────────

export const useBrandStore = create<BrandStore>((set, get) => ({
  brandContext: null,
  currentStage: 0,
  isConfigured: false,
  phases: createDefaultPhases(),

  // ── Config ──
  setBrandContext: (ctx) => set({ brandContext: ctx, isConfigured: true }),

  resetAll: () =>
    set({
      brandContext: null,
      currentStage: 0,
      isConfigured: false,
      phases: createDefaultPhases(),
    }),

  // ── Navigation ──
  setStage: (stage) => set({ currentStage: stage }),

  // ── Fetch initial assets (mock for now) ──
  fetchInitialAssets: async () => {
    const { brandContext } = get();
    if (!brandContext) return;

    // Set all phases to loading
    const phases = get().phases;
    const loadingPhases = { ...phases };
    for (const stage of STAGES) {
      loadingPhases[stage.assetType] = {
        ...loadingPhases[stage.assetType],
        status: "loading",
        error: null,
      };
    }
    set({ phases: loadingPhases });

    // Simulate API call with delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // TODO: Replace with actual fetch to /api/generate-initial
      // const res = await fetch("/api/generate-initial", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(brandContext),
      // });
      // const data: GenerateInitialResponse = await res.json();

      const updatedPhases = { ...get().phases };
      for (const stage of STAGES) {
        const mockAsset = MOCK_ASSETS[stage.assetType];
        updatedPhases[stage.assetType] = {
          ...updatedPhases[stage.assetType],
          asset: { ...mockAsset, id: `${mockAsset.id}-${Date.now()}` },
          status: "pending",
          error: null,
        };
      }
      set({ phases: updatedPhases });
    } catch (err) {
      // Per-phase error — preserves user input
      const errorPhases = { ...get().phases };
      for (const stage of STAGES) {
        if (errorPhases[stage.assetType].status === "loading") {
          errorPhases[stage.assetType] = {
            ...errorPhases[stage.assetType],
            status: "error",
            error: err instanceof Error ? err.message : "Generation failed. Please retry.",
          };
        }
      }
      set({ phases: errorPhases });
    }
  },

  // ── Accept ──
  acceptAsset: (type) => {
    const phases = { ...get().phases };
    phases[type] = { ...phases[type], status: "accepted" };
    set({ phases });
  },

  // ── Refine (improve current) ──
  refineAsset: async (type, feedback, attachedContext) => {
    const state = get();
    const phase = state.phases[type];
    if (!phase.asset) return;

    const phases = { ...state.phases };
    phases[type] = { ...phases[type], status: "loading", error: null };
    set({ phases });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // TODO: Replace with actual fetch to /api/refine-asset
      // const res = await fetch("/api/refine-asset", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     type,
      //     previous_content: phase.asset.content,
      //     user_feedback: feedback,
      //     brand_context: state.brandContext,
      //     attached_context: attachedContext,
      //   }),
      // });
      // const data: RefineAssetResponse = await res.json();

      const refined: BrandAsset = {
        id: `refined-${Date.now()}`,
        type,
        content: `[Refined] ${phase.asset.content}\n\n— Based on feedback: "${feedback}"`,
        confidence_score: Math.min(99, phase.asset.confidence_score + Math.floor(Math.random() * 10)),
        ai_acknowledgement: `Understood. Adjusting based on: "${feedback}"`,
      };

      const updatedPhases = { ...get().phases };
      updatedPhases[type] = {
        ...updatedPhases[type],
        asset: refined,
        status: "pending",
        error: null,
      };
      set({ phases: updatedPhases });
    } catch (err) {
      const errorPhases = { ...get().phases };
      errorPhases[type] = {
        ...errorPhases[type],
        status: "error",
        error: err instanceof Error ? err.message : "Refinement failed. Your input has been preserved.",
      };
      set({ phases: errorPhases });
    }
  },

  // ── Retry from scratch ──
  retryAssetFromScratch: async (type, phaseConfig, attachedContext) => {
    const state = get();
    const phases = { ...state.phases };
    phases[type] = {
      ...phases[type],
      status: "loading",
      error: null,
      phaseConfig,
    };
    set({ phases });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // TODO: Replace with actual fetch to /api/generate-initial (single asset)
      const mockAsset = MOCK_ASSETS[type];
      const regenerated: BrandAsset = {
        id: `retry-${Date.now()}`,
        type,
        content: `[Fresh] ${mockAsset.content}`,
        confidence_score: 70 + Math.floor(Math.random() * 25),
      };

      const updatedPhases = { ...get().phases };
      updatedPhases[type] = {
        ...updatedPhases[type],
        asset: regenerated,
        status: "pending",
        error: null,
      };
      set({ phases: updatedPhases });
    } catch (err) {
      const errorPhases = { ...get().phases };
      errorPhases[type] = {
        ...errorPhases[type],
        status: "error",
        error: err instanceof Error ? err.message : "Retry failed. Your config has been preserved.",
      };
      set({ phases: errorPhases });
    }
  },

  // ── Helpers ──
  getPhase: (type) => get().phases[type],

  getAcceptedPhases: () => {
    const phases = get().phases;
    return STAGES.filter((s) => phases[s.assetType].status === "accepted" && phases[s.assetType].asset)
      .map((s) => ({
        type: s.assetType,
        content: phases[s.assetType].asset!.content,
      }));
  },
}));
