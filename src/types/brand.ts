// ─── Brand Architect Types ───────────────────────────────────────────

export type AssetType = "tagline" | "visual_concept" | "logo_concept" | "marketing_content";

export type StageId = 0 | 1 | 2 | 3;

export interface Stage {
  id: StageId;
  label: string;
  assetType: AssetType;
  icon: string; // lucide icon name
  description: string;
}

export const STAGES: Stage[] = [
  {
    id: 0,
    label: "Taglines",
    assetType: "tagline",
    icon: "Sparkles",
    description: "Brand taglines & descriptions",
  },
  {
    id: 1,
    label: "Visuals",
    assetType: "visual_concept",
    icon: "Palette",
    description: "Visual concept suggestions",
  },
  {
    id: 2,
    label: "Logos",
    assetType: "logo_concept",
    icon: "PenTool",
    description: "Logo ideas & concepts",
  },
  {
    id: 3,
    label: "Marketing",
    assetType: "marketing_content",
    icon: "Megaphone",
    description: "Marketing content & copy",
  },
];

// ─── API Contract ────────────────────────────────────────────────────

export interface BrandContext {
  brand_name: string;
  description: string;
  industry: string;
  vibe: string;
  target_audience: string;
}

export interface BrandAsset {
  id: string;
  type: AssetType;
  content: string;
  confidence_score: number;
  ai_acknowledgement?: string;
}

export type AssetStatus = "pending" | "accepted" | "rejected" | "loading" | "error";

export interface PhaseState {
  asset: BrandAsset | null;
  status: AssetStatus;
  error: string | null;
  /** User's phase-specific config overrides used during generation */
  phaseConfig: Record<string, string>;
}

// ─── API Request / Response shapes ──────────────────────────────────

export interface GenerateInitialRequest {
  brand_name: string;
  industry: string;
  vibe: string;
  target_audience: string;
  description: string;
}

export interface GenerateInitialResponse {
  assets: BrandAsset[];
}

export interface RefineAssetRequest {
  type: AssetType;
  previous_content: string;
  user_feedback: string;
  brand_context: Partial<BrandContext>;
  attached_context?: AttachedContext[];
}

export interface RetryAssetRequest {
  type: AssetType;
  brand_context: Partial<BrandContext>;
  phase_config: Record<string, string>;
  attached_context?: AttachedContext[];
}

export interface RefineAssetResponse {
  content: string;
  confidence_score: number;
  ai_acknowledgement: string;
}

export interface AttachedContext {
  phase: AssetType;
  content: string;
}
