import React from 'react';

function Shimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full skeleton-shimmer">
      <div className="w-full h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="min-w-[150px] sm:min-w-[200px] md:min-w-[240px] aspect-[2/3] rounded-2xl bg-[#111117] border border-white/5 relative overflow-hidden">
      <Shimmer />
      {/* Poster area shimmer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
        <div className="h-3 bg-white/[0.06] rounded w-3/4" />
        <div className="h-2 bg-white/[0.04] rounded w-1/2" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-[70vh] md:h-screen bg-[#0A0A0F] flex items-end p-8 md:p-16 relative overflow-hidden">
      <Shimmer />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent z-10" />
      <div className="w-full max-w-2xl flex flex-col gap-4 relative z-20">
        <div className="h-4 bg-white/[0.06] rounded w-1/4" />
        <div className="h-12 bg-white/[0.08] rounded-xl w-3/4" />
        <div className="h-4 bg-white/[0.06] rounded w-full" />
        <div className="h-4 bg-white/[0.06] rounded w-5/6" />
        <div className="flex gap-4 mt-2">
          <div className="h-12 bg-white/[0.08] rounded-xl w-32" />
          <div className="h-12 bg-white/[0.06] rounded-xl w-32" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#0A0A0F] flex flex-col gap-10">
      <div className="w-full h-[50vh] bg-white/[0.03] relative overflow-hidden">
        <Shimmer />
      </div>
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="h-10 bg-white/[0.06] rounded w-2/3 relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="h-4 bg-white/[0.04] rounded w-1/3 relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="h-24 bg-white/[0.03] rounded-xl w-full relative overflow-hidden">
            <Shimmer />
          </div>
        </div>
        <div className="h-64 bg-white/[0.06] rounded-2xl w-full relative overflow-hidden">
          <Shimmer />
        </div>
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden px-6 md:px-12">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
