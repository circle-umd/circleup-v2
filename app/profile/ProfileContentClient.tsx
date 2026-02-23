"use client";

import { useRouter } from "next/navigation";
import { ProfileDisplay } from "@/components/profile/ProfileDisplay";
import type { Profile } from "./types";

interface ProfileContentClientProps {
  profile: Profile | null;
  userId: string;
  friendCount: number;
}

export function ProfileContentClient({
  profile,
  userId,
  friendCount,
}: ProfileContentClientProps) {
  const router = useRouter();

  const handleProfileUpdated = () => {
    router.refresh();
  };

  return (
    <ProfileDisplay
      profile={profile}
      userId={userId}
      friendCount={friendCount}
      onProfileUpdated={handleProfileUpdated}
    />
  );
}
