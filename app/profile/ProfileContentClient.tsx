"use client";

import { useEffect } from "react";
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

  // Prevent body scroll when ScrollArea is at top and user tries to swipe down
  useEffect(() => {
    const scrollArea = document.querySelector('[data-scroll-area]');
    if (!scrollArea) return;
    
    let touchStartY = 0;
    let isScrollingDown = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const scrollContainer = target.closest('[data-scroll-area]');
      if (scrollContainer) {
        const scrollEl = scrollContainer.querySelector('[data-scroll-content]') as HTMLElement;
        if (scrollEl) {
          touchStartY = e.touches[0].clientY;
          // If at top and user touches, prepare to prevent body scroll
          if (scrollEl.scrollTop === 0) {
            isScrollingDown = true;
          }
        }
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isScrollingDown) {
        const scrollArea = document.querySelector('[data-scroll-area]');
        if (scrollArea) {
          const scrollEl = scrollArea.querySelector('[data-scroll-content]') as HTMLElement;
          if (scrollEl && scrollEl.scrollTop === 0) {
            const touchY = e.touches[0].clientY;
            // If swiping down (touch moving down), prevent body scroll
            if (touchY > touchStartY) {
              e.preventDefault();
              document.body.style.overflow = 'hidden';
            }
          }
        }
      }
    };
    
    const handleTouchEnd = () => {
      document.body.style.overflow = '';
      isScrollingDown = false;
    };
    
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      document.body.style.overflow = '';
    };
  }, []);

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
