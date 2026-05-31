import React from 'react';

export function Skeleton({ className = '', as: Tag = 'div', children, ...rest }) {
  return (
    <Tag
      className={`relative overflow-hidden bg-white/[0.04] border border-white/[0.05] rounded-xl ${className}`}
      {...rest}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-[shimmer_2s_linear_infinite]" />
      {children}
    </Tag>
  );
}

export function SkinCardSkeleton() {
  return (
    <Skeleton className="h-[340px] rounded-2xl p-5 flex flex-col gap-4">
      <Skeleton className="h-32 rounded-xl bg-white/[0.03]" />
      <Skeleton className="h-3 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
      <div className="mt-auto flex justify-between">
        <Skeleton className="h-7 w-20 rounded-lg" />
        <Skeleton className="h-7 w-16 rounded-lg" />
      </div>
    </Skeleton>
  );
}

export default Skeleton;
