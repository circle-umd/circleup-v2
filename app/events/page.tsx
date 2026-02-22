"use client";

import { useEffect, useState } from "react";
import type { Event } from "./types";
import { getForYouEvents, getPopularEvents } from "./data";
import { EventCard } from "./EventCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  const [forYouEvents, setForYouEvents] = useState<Event[]>([]);
  const [popularEvents, setPopularEvents] = useState<Event[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadEvents() {
      const [forYou, popular] = await Promise.all([
        getForYouEvents(10, 0),
        getPopularEvents(),
      ]);
      setForYouEvents(forYou);
      setPopularEvents(popular);
      // If we got less than 10 events, there are no more to load
      setHasMoreEvents(forYou.length === 10);
    }
    loadEvents();
  }, []);

  const handleAccept = (id: string, list: "forYou" | "popular") => {
    if (list === "forYou") {
      setForYouEvents((prev) => prev.filter((e) => e.id !== id));
    } else {
      setPopularEvents((prev) => prev.filter((e) => e.id !== id));
    }
    toast({
      title: "Event saved",
      description: "You've marked this event as going.",
    });
  };

  const handleDismiss = (id: string, list: "forYou" | "popular") => {
    if (list === "forYou") {
      setForYouEvents((prev) => prev.filter((e) => e.id !== id));
    } else {
      setPopularEvents((prev) => prev.filter((e) => e.id !== id));
    }
    toast({
      title: "Event dismissed",
      description: "This event has been removed from your feed.",
    });
  };

  const handleShowMore = async () => {
    setIsLoadingMore(true);
    try {
      const moreEvents = await getForYouEvents(5, forYouEvents.length);
      if (moreEvents.length === 0) {
        setHasMoreEvents(false);
      } else {
        setForYouEvents((prev) => [...prev, ...moreEvents]);
        // If we got less than 5 events, there are no more to load
        setHasMoreEvents(moreEvents.length === 5);
      }
    } catch (error) {
      console.error("Error loading more events:", error);
      toast({
        title: "Error",
        description: "Failed to load more events. Please try again.",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <ScrollArea className="flex-1 px-4 pt-4 pb-24">
        <div className="space-y-6">
          {/* For You Section */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">For You</h2>
            <div className="space-y-4">
              {forYouEvents.length > 0 ? (
                <>
                  {forYouEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onAccept={() => handleAccept(event.id, "forYou")}
                      onDismiss={() => handleDismiss(event.id, "forYou")}
                    />
                  ))}
                  {hasMoreEvents && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={handleShowMore}
                        disabled={isLoadingMore}
                      >
                        {isLoadingMore ? "Loading..." : "Show more"}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No more events for you. Check back later!
                </p>
              )}
            </div>
          </section>

          <Separator />

          {/* Popular with Friends Section */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Popular with friends</h2>
            <div className="space-y-4">
              {popularEvents.length > 0 ? (
                popularEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onAccept={() => handleAccept(event.id, "popular")}
                    onDismiss={() => handleDismiss(event.id, "popular")}
                    variant="popular"
                  />
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No popular events right now.
                </p>
              )}
            </div>
          </section>
        </div>
      </ScrollArea>
      <BottomNav />
    </div>
  );
}
