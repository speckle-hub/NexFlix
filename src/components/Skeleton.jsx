import React from 'react';

export function CardSkeleton() {
  return (
    <div className="min-w-[150px] sm:min-w-[200px] md:min-w-[240px] aspect-[2/3] rounded-2xl bg-[#111117] border border-white/5 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-[70vh] md:h-screen bg-[#0A0A0F] animate-pulse flex items-end p-8 md:p-16 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent z-10" />
      <div className="w-full max-w-2xl flex flex-col gap-4 relative z-20">
        <div className="h-4 bg-white/10 rounded w-1/4" />
        <div className="h-12 bg-white/15 rounded-xl w-3/4" />
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-5/6" />
        <div className="flex gap-4 mt-2">
          <div className="h-12 bg-white/20 rounded-xl w-32" />
          <div className="h-12 bg-white/10 rounded-xl w-32" />
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
      <div className="w-full h-[50vh] bg-white/5 animate-pulse" />
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="h-10 bg-white/10 rounded w-2/3 animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-1/3 animate-pulse" />
          <div className="h-24 bg-white/5 rounded-xl w-full animate-pulse" />
        </div>
        <div className="h-64 bg-white/10 rounded-2xl w-full animate-pulse" />
      </div>
    </div>
  );
}
