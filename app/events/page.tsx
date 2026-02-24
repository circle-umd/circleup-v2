"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Event } from "./types";
import { getForYouEvents, getPopularWithFriendsEvents } from "./data";
import { createRsvp, checkRsvpStatus } from "./rsvp";
import { EventCard } from "./EventCard";
import { EventCardSkeleton } from "./EventCardSkeleton";
import { EventDetailsSheet } from "./EventDetailsSheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function EventsPage() {
  const [forYouEvents, setForYouEvents] = useState<Event[]>([]);
  const [popularEvents, setPopularEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acceptedEventIds, setAcceptedEventIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    async function loadEvents() {
      try {
        // Get current user ID for popular events
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // Fetch popular events and regular events in parallel
        const [popular, forYou] = await Promise.all([
          user && !authError ? getPopularWithFriendsEvents(user.id, 50, 0) : Promise.resolve([]),
          getForYouEvents(10, 0),
        ]);

        setPopularEvents(popular);

        // Deduplicate: filter out popular event IDs from regular events
        const popularEventIds = new Set(popular.map((e) => e.id));
        const filteredForYou = forYou.filter((e) => !popularEventIds.has(e.id));

        setForYouEvents(filteredForYou);
        // If we got less than 10 events, there are no more to load
        setHasMoreEvents(filteredForYou.length === 10);

        // Check RSVP status for all loaded events
        if (user && !authError) {
          const allEventIds = [...popular.map((e) => e.id), ...filteredForYou.map((e) => e.id)];
          const acceptedIds = new Set<string>();
          
          // Batch check RSVP status for all events
          await Promise.all(
            allEventIds.map(async (eventId) => {
              const { isAccepted } = await checkRsvpStatus(eventId, user.id);
              if (isAccepted) {
                acceptedIds.add(eventId);
              }
            })
          );
          
          setAcceptedEventIds(acceptedIds);
        }
      } catch (error) {
        console.error("Error loading events:", error);
        // Fallback to just loading regular events if popular events fail
        const forYou = await getForYouEvents(10, 0);
        setForYouEvents(forYou);
        setHasMoreEvents(forYou.length === 10);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      // Get current user ID
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Error",
          description: "You must be logged in to save events.",
          variant: "destructive",
        });
        return;
      }

      // Create RSVP with INTERESTED status
      const { error } = await createRsvp(id, user.id, 'INTERESTED');
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to save event. Please try again.",
          variant: "destructive",
        });
        // Keep event in feed on error
        return;
      }

      // Success: remove from both popular and regular arrays and mark as accepted
      setPopularEvents((prev) => prev.filter((e) => e.id !== id));
      setForYouEvents((prev) => prev.filter((e) => e.id !== id));
      setAcceptedEventIds((prev) => new Set(prev).add(id));
      toast({
        title: "Event saved",
        description: "You've marked this event as interested.",
      });
    } catch (error) {
      console.error("Unexpected error in handleAccept:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      // Get current user ID
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Error",
          description: "You must be logged in to dismiss events.",
          variant: "destructive",
        });
        return;
      }

      // Create RSVP with HIDDEN status
      const { error } = await createRsvp(id, user.id, 'HIDDEN');
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to dismiss event. Please try again.",
          variant: "destructive",
        });
        // Keep event in feed on error
        return;
      }

      // Success: remove from both popular and regular arrays
      setPopularEvents((prev) => prev.filter((e) => e.id !== id));
      setForYouEvents((prev) => prev.filter((e) => e.id !== id));
      toast({
        title: "Event dismissed",
        description: "This event has been removed from your feed.",
      });
    } catch (error) {
      console.error("Unexpected error in handleDismiss:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleModalAccept = () => {
    if (selectedEvent) {
      handleAccept(selectedEvent.id);
    }
  };

  const handleModalDismiss = () => {
    if (selectedEvent) {
      handleDismiss(selectedEvent.id);
    }
  };

  const handleShowMore = async () => {
    setIsLoadingMore(true);
    try {
      // Get current user ID for RSVP status check
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      // Load more regular events only (popular events stay at top)
      // We need to account for popular events that were filtered out from the initial query
      // So we fetch more events and deduplicate again
      const moreEvents = await getForYouEvents(5, forYouEvents.length + popularEvents.length);
      
      if (moreEvents.length === 0) {
        setHasMoreEvents(false);
      } else {
        // Deduplicate: filter out popular event IDs from new events
        const popularEventIds = new Set(popularEvents.map((e) => e.id));
        const filteredMoreEvents = moreEvents.filter((e) => !popularEventIds.has(e.id));
        
        if (filteredMoreEvents.length > 0) {
          setForYouEvents((prev) => [...prev, ...filteredMoreEvents]);

          // Check RSVP status for newly loaded events
          if (user && !authError) {
            const newAcceptedIds = new Set<string>();
            await Promise.all(
              filteredMoreEvents.map(async (event) => {
                const { isAccepted } = await checkRsvpStatus(event.id, user.id);
                if (isAccepted) {
                  newAcceptedIds.add(event.id);
                }
              })
            );
            setAcceptedEventIds((prev) => new Set([...prev, ...newAcceptedIds]));
          }
        }
        // If we got less than 5 events (or all were filtered), there are no more to load
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
      <ScrollArea 
        className="flex-1 px-4 pt-4"
        style={{
          paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))',
        }}
      >
        <div className="space-y-6">
          {/* For You Section */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">For You</h2>
            <div className="space-y-4">
              {isLoading ? (
                // Show 5 skeleton cards while loading
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <EventCardSkeleton key={i} />
                  ))}
                </>
              ) : (
                <>
                  {/* Popular Events - rendered first */}
                  {popularEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.35, delay: index * 0.05 }}
                    >
                      <EventCard
                        event={event}
                        onAccept={() => handleAccept(event.id)}
                        onDismiss={() => handleDismiss(event.id)}
                        onClick={() => handleCardClick(event)}
                        variant="popular"
                        isAlreadyAccepted={acceptedEventIds.has(event.id)}
                      />
                    </motion.div>
                  ))}
                  {/* Regular Events */}
                  {forYouEvents.length > 0 ? (
                    <>
                      {forYouEvents.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.35,
                            delay: (popularEvents.length + index) * 0.05,
                          }}
                        >
                          <EventCard
                            event={event}
                            onAccept={() => handleAccept(event.id)}
                            onDismiss={() => handleDismiss(event.id)}
                            onClick={() => handleCardClick(event)}
                            isAlreadyAccepted={acceptedEventIds.has(event.id)}
                          />
                        </motion.div>
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
                  ) : popularEvents.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No more events for you. Check back later!
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </section>
        </div>
      </ScrollArea>
      <BottomNav />
      <EventDetailsSheet
        event={selectedEvent}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAccept={handleModalAccept}
        onDismiss={handleModalDismiss}
        isAlreadyAccepted={selectedEvent ? acceptedEventIds.has(selectedEvent.id) : false}
      />
    </div>
  );
}
