import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function CatchCardSkeleton() {
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-3.5 w-28" />
        </div>
        <Skeleton className="mb-3 h-64 w-full rounded-lg" />
        <Skeleton className="mb-2 h-4 w-36" />
        <Skeleton className="h-3.5 w-24" />
      </CardContent>
    </Card>
  );
}
