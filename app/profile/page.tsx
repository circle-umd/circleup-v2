import { BottomNav } from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Suspense } from "react";
import type { Profile } from "./types";
import { ProfileContentClient } from "./ProfileContentClient";
import { ProfileSkeleton } from "./ProfileSkeleton";

async function ProfileContent() {
  const supabase = await createClient();
  
  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch friend count
  // Use user_id only since friendships use double-row architecture
  const { count: friendCount, error: friendCountError } = await supabase
    .from("friendships")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "ACCEPTED");

  if (profileError) {
    // Profile doesn't exist yet, return null
    if (profileError.code === "PGRST116") {
      return (
        <ProfileContentClient
          profile={null}
          userId={user.id}
          friendCount={friendCountError ? 0 : friendCount || 0}
        />
      );
    }
    // Other errors - log and return null
    console.error("Error fetching profile:", profileError);
    return (
      <ProfileContentClient
        profile={null}
        userId={user.id}
        friendCount={friendCountError ? 0 : friendCount || 0}
      />
    );
  }

  return (
    <ProfileContentClient
      profile={profile}
      userId={user.id}
      friendCount={friendCountError ? 0 : friendCount || 0}
    />
  );
}

export default function ProfilePage() {
  return (
    <div className="mx-auto flex h-[100dvh] max-w-md flex-col bg-background">
      <ScrollArea 
        className="flex-1 px-4 pt-4"
        style={{
          paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))',
        }}
      >
        <div className="space-y-6">
          <section>
            <Suspense fallback={<ProfileSkeleton />}>
              <ProfileContent />
            </Suspense>
          </section>
        </div>
      </ScrollArea>
      <BottomNav />
    </div>
  );
}
