"use client";

import { useEffect, useState } from "react";
import type { Event } from "./types";
import { getForYouEvents } from "./data";
import { createRsvp } from "./rsvp";
import { EventCard } from "./EventCard";
import { EventDetailsSheet } from "./EventDetailsSheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function EventsPage() {
  const [forYouEvents, setForYouEvents] = useState<Event[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadEvents() {
      const forYou = await getForYouEvents(10, 0);
      setForYouEvents(forYou);
      // If we got less than 10 events, there are no more to load
      setHasMoreEvents(forYou.length === 10);
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

      // Success: remove from local state and show toast
      setForYouEvents((prev) => prev.filter((e) => e.id !== id));
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

      // Success: remove from local state and show toast
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
                      onAccept={() => handleAccept(event.id)}
                      onDismiss={() => handleDismiss(event.id)}
                      onClick={() => handleCardClick(event)}
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
        </div>
      </ScrollArea>
      <BottomNav />
      <EventDetailsSheet
        event={selectedEvent}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAccept={handleModalAccept}
        onDismiss={handleModalDismiss}
      />
    </div>
  );
}
