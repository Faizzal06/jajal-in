import React from 'react';

export default function ProfileSkeleton() {
  return (
    <section className="space-y-xl py-lg">
      
      {/* 1. Guest Banner Skeleton (Opsional, asumsikan state awal sebelum cek auth) */}
      <div className="bg-surface-variant/20 rounded-[24px] p-6 border border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-full shimmer bg-surface-variant/50 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 shimmer bg-surface-variant/50 rounded" />
            <div className="h-3 w-3/4 sm:w-64 shimmer bg-surface-variant/50 rounded" />
          </div>
        </div>
        <div className="h-9 w-full sm:w-32 shimmer bg-surface-variant/50 rounded-full shrink-0" />
      </div>

      {/* 2. Profile Card Skeleton */}
      <div className="bg-surface-variant/10 rounded-[24px] p-6 border border-outline-variant flex flex-col md:flex-row md:items-center gap-lg">
        <div className="flex items-center gap-4 md:flex-col md:items-start">
          <div className="w-24 h-24 rounded-full shimmer bg-surface-variant/50 shrink-0" />
          <div className="space-y-2">
            <div className="h-6 w-32 shimmer bg-surface-variant/50 rounded" />
            <div className="h-4 w-24 shimmer bg-surface-variant/50 rounded" />
            <div className="h-3 w-20 shimmer bg-surface-variant/50 rounded" />
          </div>
        </div>
        <div className="flex-1 space-y-4 w-full mt-4 md:mt-0">
          <div>
            <div className="flex justify-between mb-2">
              <div className="h-4 w-20 shimmer bg-surface-variant/50 rounded" />
              <div className="h-4 w-16 shimmer bg-surface-variant/50 rounded" />
            </div>
            <div className="h-2 w-full shimmer bg-surface-variant/50 rounded-full" />
          </div>
          <div className="flex gap-3">
            <div className="h-9 flex-1 shimmer bg-surface-variant/50 rounded-full" />
            <div className="h-9 flex-1 shimmer bg-surface-variant/50 rounded-full" />
            <div className="h-9 flex-1 shimmer bg-surface-variant/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* 3. Stats Bento Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-variant/10 rounded-[16px] p-4 border border-outline-variant flex flex-col items-center">
            <div className="w-6 h-6 rounded-full shimmer bg-surface-variant/50 mb-2" />
            <div className="h-6 w-12 shimmer bg-surface-variant/50 rounded mb-2" />
            <div className="h-3 w-16 shimmer bg-surface-variant/50 rounded" />
          </div>
        ))}
      </div>

      {/* 4. Elite Guide Program Skeleton */}
      <div className="bg-surface-variant/20 rounded-[24px] p-6 flex flex-col md:flex-row items-center gap-4">
         <div className="w-16 h-16 rounded-full shimmer bg-surface-variant/50 shrink-0" />
         <div className="flex-1 space-y-2 text-center md:text-left">
           <div className="h-5 w-40 shimmer bg-surface-variant/50 rounded mx-auto md:mx-0" />
           <div className="h-3 w-48 shimmer bg-surface-variant/50 rounded mx-auto md:mx-0" />
         </div>
         <div className="h-9 w-28 shimmer bg-surface-variant/50 rounded-full shrink-0 mt-4 md:mt-0" />
      </div>

       {/* 5. Latest Badges Skeleton */}
       <section>
          <div className="flex justify-between mb-4">
             <div className="h-6 w-32 shimmer bg-surface-variant/50 rounded" />
             <div className="h-4 w-20 shimmer bg-surface-variant/50 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
               <div key={i} className="bg-surface-variant/10 rounded-[16px] p-4 border border-outline-variant flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full shimmer bg-surface-variant/50 shrink-0" />
                  <div className="space-y-2 flex-1">
                     <div className="h-4 w-24 shimmer bg-surface-variant/50 rounded" />
                     <div className="h-3 w-full shimmer bg-surface-variant/50 rounded" />
                  </div>
               </div>
            ))}
          </div>
       </section>

    </section>
  );
}