import { Skeleton } from "@/components/ui/skeleton";

export function NFTSkeleton() {
  return (
    <div className="bg-card rounded overflow-hidden shadow-card">
      <Skeleton className="aspect-square w-full bg-secondary" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-secondary" />
        <Skeleton className="h-3 w-1/2 bg-secondary" />
      </div>
    </div>
  );
}

export function NFTGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => `skeleton-${i}`).map((key) => (
        <NFTSkeleton key={key} />
      ))}
    </div>
  );
}
