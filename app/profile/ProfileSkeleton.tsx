import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Edit Button */}
      <div className="flex justify-end">
        <Skeleton className="h-9 w-16" />
      </div>

      {/* Profile Header - Horizontal Layout */}
      <div className="flex items-start gap-4">
        {/* Avatar - Large circle on left */}
        <Skeleton className="h-24 w-24 shrink-0 rounded-full" />

        {/* Info - Name, username, friend count on right */}
        <div className="flex-1 space-y-1 pt-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      {/* Bio Section */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* My Events Section */}
      <section className="space-y-4">
        <Skeleton className="h-7 w-32" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 shrink-0" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
