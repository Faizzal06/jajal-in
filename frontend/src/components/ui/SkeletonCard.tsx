import React from 'react';

/**
 * Skeleton placeholder that mimics the layout of an UMKM Card.
 * Uses Tailwind's `animate-pulse` for a subtle loading shimmer.
 */
export default function SkeletonCard() {
  return (
    <div className="border border-outline-variant rounded-xl overflow-hidden animate-pulse bg-surface">
      {/* Image placeholder */}
      <div className="h-48 w-full bg-gray-200" />
      {/* Content placeholders */}
      <div className="p-lg">
        {/* Title */}
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
        {/* Description line 1 */}
        <div className="mt-2 h-4 w-full bg-gray-200 rounded" />
        {/* Description line 2 */}
        <div className="mt-1 h-4 w-5/6 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
