import { BottomNav } from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileDisplay } from "@/components/profile/ProfileDisplay";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Profile } from "./types";

async function getProfile(): Promise<Profile | null> {
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

  if (profileError) {
    // Profile doesn't exist yet, return null
    if (profileError.code === "PGRST116") {
      return null;
    }
    // Other errors - log and return null
    console.error("Error fetching profile:", profileError);
    return null;
  }

  return profile;
}

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <ScrollArea className="flex-1 px-4 pt-4 pb-24">
        <div className="space-y-6">
          <section>
            <h1 className="mb-6 text-2xl font-semibold">Profile</h1>
            <ProfileDisplay profile={profile} />
          </section>
        </div>
      </ScrollArea>
      <BottomNav />
    </div>
  );
}
