'use client';

import SkeletonCard from '@/components/ui/SkeletonCard';

export default function Loading() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </section>
  );
}
