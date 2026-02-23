"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileEditForm } from "./ProfileEditForm";
import { ProfileEventCard } from "./ProfileEventCard";
import { EventDetailsSheet } from "@/app/events/EventDetailsSheet";
import { getMyEvents } from "@/app/profile/data";
import { createRsvp } from "@/app/events/rsvp";
import { useToast } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/app/profile/types";
import type { Event } from "@/app/events/types";
import { Pencil } from "lucide-react";

interface ProfileDisplayProps {
  profile: Profile | null;
  userId: string;
  friendCount: number;
  onProfileUpdated: () => void;
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0).toUpperCase() || "";
  const last = lastName?.charAt(0).toUpperCase() || "";
  if (first && last) return `${first}${last}`;
  if (first) return first;
  if (last) return last;
  return "?";
}

function getFullName(firstName: string | null, lastName: string | null): string {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return "Not set";
}


export function ProfileDisplay({
  profile,
  userId,
  friendCount,
  onProfileUpdated,
}: ProfileDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadEvents() {
      setIsLoadingEvents(true);
      const events = await getMyEvents(userId);
      setMyEvents(events);
      setIsLoadingEvents(false);
    }
    loadEvents();
  }, [userId]);

  const handleSave = () => {
    setIsEditing(false);
    onProfileUpdated();
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEventCardClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventSheetOpen(true);
  };

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
        // Keep event in list on error
        return;
      }

      // Success: remove from local state and show toast
      setMyEvents((prev) => prev.filter((e) => e.id !== id));
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
        // Keep event in list on error
        return;
      }

      // Success: remove from local state and show toast
      setMyEvents((prev) => prev.filter((e) => e.id !== id));
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

  const handleModalAccept = () => {
    if (selectedEvent) {
      handleAccept(selectedEvent.id);
      setIsEventSheetOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleModalDismiss = () => {
    if (selectedEvent) {
      handleDismiss(selectedEvent.id);
      setIsEventSheetOpen(false);
      setSelectedEvent(null);
    }
  };

  if (isEditing) {
    return (
      <ProfileEditForm
        profile={profile}
        userId={userId}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  if (!profile) {
    return (
      <div className="py-8 text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Profile not found. Please complete your profile setup.
        </p>
        <Button onClick={() => setIsEditing(true)}>
          Set up your profile
        </Button>
      </div>
    );
  }

  const fullName = getFullName(profile.first_name, profile.last_name);
  const initials = getInitials(profile.first_name, profile.last_name);

  return (
    <div className="space-y-6">
      {/* Edit Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Profile Header - Horizontal Layout */}
      <div className="flex items-start gap-4">
        {/* Avatar - Large circle on left */}
        <Avatar className="h-24 w-24 shrink-0">
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={fullName} />
          ) : null}
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>

        {/* Info - Name, username, friend count on right */}
        <div className="flex-1 space-y-1 pt-2">
          <h2 className="text-xl font-semibold">{fullName}</h2>
          {profile.username ? (
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Username not set</p>
          )}
          <Link
            href="/friends"
            className="text-sm text-muted-foreground hover:underline inline-block"
          >
            {friendCount} {friendCount === 1 ? "friend" : "friends"}
          </Link>
        </div>
      </div>

      {/* Bio Section */}
      {profile.bio && (
        <div className="space-y-2">
          <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}

      {/* My Events Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">My Events</h3>
        {isLoadingEvents ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading events...
          </div>
        ) : myEvents.length > 0 ? (
          <div className="space-y-4">
            {myEvents.map((event) => (
              <ProfileEventCard
                key={event.id}
                event={event}
                onClick={() => handleEventCardClick(event)}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No upcoming events. Start exploring to find events you're interested in!
          </div>
        )}
      </section>

      {/* Event Details Sheet */}
      <EventDetailsSheet
        event={selectedEvent}
        open={isEventSheetOpen}
        onOpenChange={setIsEventSheetOpen}
        onAccept={handleModalAccept}
        onDismiss={handleModalDismiss}
      />
    </div>
  );
}
