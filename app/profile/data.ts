import type { Event } from "../events/types";
import { createClient } from "@/lib/supabase/client";

/**
 * Formats a timestamp as an absolute date string.
 * Format: "Monday, Dec 15, 2024 at 8:00 PM"
 */
function formatEventTime(timestamp: string): string {
  const date = new Date(timestamp);
  const weekdayPart = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(date);
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${weekdayPart}, ${datePart} at ${timePart}`;
}

/**
 * Fetches events where the user has RSVP'd with status 'GOING' or 'INTERESTED'
 * @param userId - The user's ID
 * @returns Array of Event objects
 */
export async function getMyEvents(userId: string): Promise<Event[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("event_rsvps")
      .select(
        `
        event_id,
        status,
        events (
          id,
          title,
          description,
          start_time,
          location
        )
      `,
      )
      .eq("user_id", userId)
      .in("status", ["GOING", "INTERESTED"]);

    if (error) {
      console.error("Error fetching my events:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Filter and map the data
    const now = new Date();
    const eventsWithTime: Array<Event & { startTime: string }> = [];

    for (const rsvp of data) {
      const event = rsvp.events;
      if (event && typeof event === "object" && !Array.isArray(event)) {
        const eventData = event as {
          id: string;
          title: string;
          description: string | null;
          start_time: string;
          location: string | null;
        };

        // Only include upcoming events
        if (new Date(eventData.start_time) >= now) {
          eventsWithTime.push({
            id: eventData.id,
            title: eventData.title,
            description: eventData.description || "",
            location: eventData.location || "",
            time: formatEventTime(eventData.start_time),
            attendees: [],
            startTime: eventData.start_time,
          });
        }
      }
    }

    // Sort by start_time ascending
    eventsWithTime.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    // Remove startTime from final result
    return eventsWithTime.map(({ startTime, ...event }) => event);
  } catch (error) {
    console.error("Unexpected error fetching my events:", error);
    return [];
  }
}

/**
 * Fetches the count of accepted friendships for a user
 * Uses the double-row architecture: count rows where user_id = userId
 * (each friendship has 2 rows, so counting user_id rows gives correct count)
 * @param userId - The user's ID
 * @returns Number of friends
 */
export async function getFriendCount(userId: string): Promise<number> {
  try {
    const supabase = createClient();

    const { count, error } = await supabase
      .from("friendships")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "ACCEPTED");

    if (error) {
      console.error("Error fetching friend count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Unexpected error fetching friend count:", error);
    return 0;
  }
}
