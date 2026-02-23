"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <ProfileDisplay
        profile={profile}
        userId={userId}
        friendCount={friendCount}
        onProfileUpdated={handleProfileUpdated}
      />
    </motion.div>
  );
}
