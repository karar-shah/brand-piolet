"use client";

export function LoadingSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 animate-card-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-36 skeleton-shimmer rounded-lg" />
          <div className="h-3 w-52 skeleton-shimmer rounded-lg" />
        </div>
        <div className="h-16 w-16 skeleton-shimmer rounded-full" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-3 pt-4">
        <div className="h-4 w-full skeleton-shimmer rounded-lg" />
        <div className="h-4 w-5/6 skeleton-shimmer rounded-lg" />
        <div className="h-4 w-4/6 skeleton-shimmer rounded-lg" />
        <div className="h-4 w-3/6 skeleton-shimmer rounded-lg" />
      </div>

      {/* AI badge skeleton */}
      <div className="flex items-center gap-3 pt-2">
        <div className="h-8 w-8 skeleton-shimmer rounded-full" />
        <div className="h-3 w-48 skeleton-shimmer rounded-lg" />
      </div>

      {/* Button area skeleton */}
      <div className="flex items-center gap-4 pt-4">
        <div className="h-12 flex-1 skeleton-shimmer rounded-xl" />
        <div className="h-12 flex-1 skeleton-shimmer rounded-xl" />
      </div>

      {/* Generating text */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="h-3 w-3 rounded-full bg-brand-gold/30 animate-pulse" />
        <span className="text-xs text-muted-foreground/50 animate-pulse">
          AI is generating your brand asset...
        </span>
      </div>
    </div>
  );
}
