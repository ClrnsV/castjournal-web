import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function CatchRowSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between">
        <div className="flex-1">
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        <Skeleton className="h-4 w-10" />
      </CardContent>
    </Card>
  );
}
