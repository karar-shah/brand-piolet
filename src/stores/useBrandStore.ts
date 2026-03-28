"use client";

import { create } from "zustand";
import type {
  BrandContext,
  AssetType,
  PhaseState,
  StageId,
  BrandAsset,
  AttachedContext,
  GenerateInitialResponse,
  RefineAssetResponse
} from "@/types/brand";
import { STAGES } from "@/types/brand";

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
  setAssetIndex: (type: AssetType, index: number) => void;

  // ── Actions: Asset lifecycle ──
  generatePhaseAsset: (type: AssetType) => Promise<void>;
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
  getAcceptedPhases: () => AttachedContext[];
}

const defaultPhaseState: PhaseState = {
  assets: [],
  currentIndex: 0,
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
  
  setAssetIndex: (type, index) => {
    const phases = { ...get().phases };
    phases[type] = { ...phases[type], currentIndex: index };
    set({ phases });
  },

  // ── Fetch Asset ──
  generatePhaseAsset: async (type) => {
    const { brandContext, getAcceptedPhases } = get();
    if (!brandContext) return;

    const phases = get().phases;
    set({
      phases: {
        ...phases,
        [type]: {
          ...phases[type],
          status: "loading",
          error: null,
        },
      },
    });

    try {
      const acceptedContext = getAcceptedPhases();
      
      const res = await fetch("/api/generate-phase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandContext, type, attachedContext: acceptedContext.length ? acceptedContext : undefined }),
      });
      if (!res.ok) {
         const errData = await res.json().catch(()=>({}));
         let msg = errData.detail || "API request failed";
         if (typeof msg !== 'string') msg = JSON.stringify(msg);
         throw new Error(msg);
      }
      const data: GenerateInitialResponse = await res.json();

      const newAssets: BrandAsset[] = data.options.map((opt, i) => ({
         id: `${type}-${Date.now()}-${i}`,
         type,
         content: opt.content,
         confidence_score: opt.confidence_score
      }));

      const updatedPhases = { ...get().phases };
      updatedPhases[type] = {
        ...updatedPhases[type],
        assets: newAssets,
        currentIndex: 0,
        status: "pending",
        error: null,
      };
      set({ phases: updatedPhases });
    } catch (err) {
      const errorPhases = { ...get().phases };
      errorPhases[type] = {
        ...errorPhases[type],
        status: "error",
        error: err instanceof Error ? err.message : "Generation failed. Please retry.",
      };
      set({ phases: errorPhases });
    }
  },

  // ── Accept ──
  acceptAsset: (type) => {
    const phases = { ...get().phases };
    phases[type] = { ...phases[type], status: "accepted" };
    set({ phases });
  },

  // ── Refine ──
  refineAsset: async (type, feedback, attachedContext) => {
    const state = get();
    const phase = state.phases[type];
    if (!phase.assets || phase.assets.length === 0) return;

    const phases = { ...state.phases };
    phases[type] = { ...phases[type], status: "loading", error: null };
    set({ phases });

    try {
      const activeContent = phase.assets[phase.currentIndex].content;
      const res = await fetch("/api/refine-phase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          brandContext: state.brandContext,
          previous_content: activeContent,
          user_feedback: feedback,
          attachedContext: attachedContext?.length ? attachedContext : undefined,
        }),
      });
      if (!res.ok) {
         const errData = await res.json().catch(()=>({}));
         let msg = errData.detail || "API request failed";
         if (typeof msg !== 'string') msg = JSON.stringify(msg);
         throw new Error(msg);
      }
      const data: RefineAssetResponse = await res.json();

      const refinedAssets: BrandAsset[] = data.options.map((opt, i) => ({
        id: `refined-${Date.now()}-${i}`,
        type,
        content: opt.content,
        confidence_score: opt.confidence_score,
        ai_acknowledgement: `Understood. Adjusting based on: "${feedback}"`,
      }));

      const updatedPhases = { ...get().phases };
      updatedPhases[type] = {
        ...updatedPhases[type],
        assets: refinedAssets,
        currentIndex: 0,
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

  // ── Retry ──
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

    try {
      const res = await fetch("/api/generate-phase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandContext: state.brandContext, type, attachedContext: attachedContext?.length ? attachedContext : undefined }),
      });
      if (!res.ok) {
         const errData = await res.json().catch(()=>({}));
         let msg = errData.detail || "API request failed";
         if (typeof msg !== 'string') msg = JSON.stringify(msg);
         throw new Error(msg);
      }
      const data: GenerateInitialResponse = await res.json();

      const newAssets: BrandAsset[] = data.options.map((opt, i) => ({
         id: `retry-${Date.now()}-${i}`,
         type,
         content: opt.content,
         confidence_score: opt.confidence_score
      }));

      const updatedPhases = { ...get().phases };
      updatedPhases[type] = {
        ...updatedPhases[type],
        assets: newAssets,
        currentIndex: 0,
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
    return STAGES.filter((s) => phases[s.assetType].status === "accepted" && phases[s.assetType].assets.length > 0)
      .map((s) => {
        const p = phases[s.assetType];
        return {
          phase: s.assetType,
          content: p.assets[p.currentIndex].content,
        };
      });
  },
}));
