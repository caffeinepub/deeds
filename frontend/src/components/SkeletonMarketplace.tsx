import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

export default function SkeletonMarketplace() {
  return (
    <Card className="overflow-hidden border-0 shadow-premium bg-card/95 backdrop-blur-md rounded-2xl flex flex-col h-full">
      <CardHeader className="pb-4 space-y-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4 flex-1 flex flex-col">
        <div className="space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        <Skeleton className="w-full h-[280px] rounded-lg" />

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="bg-accent/30 rounded-lg p-4 border border-border/50 mt-auto">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-3 pt-4 pb-4 border-t">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 flex-1 rounded-xl" />
      </CardFooter>
    </Card>
  );
}
