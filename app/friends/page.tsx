import { BottomNav } from "@/components/BottomNav";

export default function FriendsPage() {
  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4 pb-24">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold">Friends</h1>
          <p className="text-sm text-muted-foreground">
            Your friends list will appear here.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
