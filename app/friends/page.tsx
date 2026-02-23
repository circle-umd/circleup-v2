"use client";

import { useEffect, useState } from "react";
import type { Event } from "../events/types";
import { getPopularEvents } from "../events/data";
import { EventCard } from "../events/EventCard";
import { EventDetailsSheet } from "../events/EventDetailsSheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/components/ui/toaster";

export default function FriendsPage() {
  const [popularEvents, setPopularEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadEvents() {
      const popular = await getPopularEvents();
      setPopularEvents(popular);
    }
    loadEvents();
  }, []);

  const handleAccept = (id: string) => {
    setPopularEvents((prev) => prev.filter((e) => e.id !== id));
    toast({
      title: "Event saved",
      description: "You've marked this event as going.",
    });
  };

  const handleDismiss = (id: string) => {
    setPopularEvents((prev) => prev.filter((e) => e.id !== id));
    toast({
      title: "Event dismissed",
      description: "This event has been removed from your feed.",
    });
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

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <ScrollArea className="flex-1 px-4 pt-4 pb-24">
        <div className="space-y-6">
          {/* Popular with Friends Section */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Popular with friends</h2>
            <div className="space-y-4">
              {popularEvents.length > 0 ? (
                popularEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onAccept={() => handleAccept(event.id)}
                    onDismiss={() => handleDismiss(event.id)}
                    onClick={() => handleCardClick(event)}
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
