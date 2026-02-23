import type { Event, PopularEventResponse } from "./types";
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

// Mock data for development
const mockForYouEvents: Event[] = [
  {
    id: "1",
    title: "Tech Meetup Downtown",
    description:
      "Join us for an evening of networking and talks about the latest in web development.",
    location: "Downtown Conference Center",
    time: "Tonight, 8pm",
    attendees: [
      { id: "u1", name: "Alice", avatarUrl: undefined },
      { id: "u2", name: "Bob", avatarUrl: undefined },
      { id: "u3", name: "Charlie", avatarUrl: undefined },
    ],
  },
  {
    id: "2",
    title: "Weekend Hiking Adventure",
    description:
      "Explore scenic trails with fellow outdoor enthusiasts. All skill levels welcome!",
    location: "Mountain Trailhead",
    time: "Saturday, 9am",
    attendees: [
      { id: "u4", name: "Diana", avatarUrl: undefined },
      { id: "u5", name: "Eve", avatarUrl: undefined },
    ],
  },
  {
    id: "3",
    title: "Coffee & Code Session",
    description:
      "Casual coding session at the local café. Bring your laptop and work on projects together.",
    location: "The Brew House",
    time: "Sunday, 2pm",
    attendees: [
      { id: "u1", name: "Alice", avatarUrl: undefined },
      { id: "u6", name: "Frank", avatarUrl: undefined },
      { id: "u7", name: "Grace", avatarUrl: undefined },
      { id: "u8", name: "Henry", avatarUrl: undefined },
    ],
  },
  {
    id: "4",
    title: "Art Gallery Opening",
    description:
      "Celebrate the opening of the new contemporary art exhibition with wine and hors d'oeuvres.",
    location: "Modern Art Gallery",
    time: "Friday, 6pm",
    attendees: [
      { id: "u9", name: "Iris", avatarUrl: undefined },
      { id: "u10", name: "Jack", avatarUrl: undefined },
    ],
  },
];

const mockPopularEvents: Event[] = [
  {
    id: "5",
    title: "Music Festival",
    description:
      "Annual summer music festival featuring local and international artists.",
    location: "City Park",
    time: "Next Saturday, 12pm",
    attendees: [
      { id: "u1", name: "Alice", avatarUrl: undefined },
      { id: "u2", name: "Bob", avatarUrl: undefined },
      { id: "u3", name: "Charlie", avatarUrl: undefined },
      { id: "u4", name: "Diana", avatarUrl: undefined },
      { id: "u5", name: "Eve", avatarUrl: undefined },
      { id: "u6", name: "Frank", avatarUrl: undefined },
    ],
  },
  {
    id: "6",
    title: "Food Truck Rally",
    description:
      "Sample delicious food from the city's best food trucks. Live music included!",
    location: "Waterfront Plaza",
    time: "Sunday, 11am",
    attendees: [
      { id: "u7", name: "Grace", avatarUrl: undefined },
      { id: "u8", name: "Henry", avatarUrl: undefined },
      { id: "u9", name: "Iris", avatarUrl: undefined },
      { id: "u10", name: "Jack", avatarUrl: undefined },
    ],
  },
  {
    id: "7",
    title: "Yoga in the Park",
    description:
      "Start your morning with a peaceful yoga session in the beautiful park setting.",
    location: "Central Park",
    time: "Tomorrow, 7am",
    attendees: [
      { id: "u1", name: "Alice", avatarUrl: undefined },
      { id: "u3", name: "Charlie", avatarUrl: undefined },
      { id: "u5", name: "Eve", avatarUrl: undefined },
    ],
  },
];

/**
 * Data abstraction layer for events.
 * Fetches upcoming events from Supabase with pagination support.
 * @param limit - Number of events to fetch (default: 10)
 * @param offset - Number of events to skip (default: 0)
 */
export async function getForYouEvents(
  limit: number = 10,
  offset: number = 0,
): Promise<Event[]> {
  try {
    const supabase = createClient();
    
    // Use unseen_events view which automatically filters out events
    // the authenticated user has already RSVP'd to (any status including HIDDEN)
    const { data, error } = await supabase
      .from("unseen_events")
      .select("id, title, description, location, start_time")
      .eq("status", "CONFIRMED")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Map database fields to Event type
    return data.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      time: formatEventTime(event.start_time),
      attendees: [],
    }));
  } catch (error) {
    console.error("Unexpected error fetching events:", error);
    return [];
  }
}

export async function getPopularEvents(): Promise<Event[]> {
  // Simulate async data fetch
  return Promise.resolve(mockPopularEvents);
}

/**
 * Fetches events that are popular with the user's friends using the RPC function.
 * @param userId - The ID of the current user
 * @param limit - Number of events to fetch (default: 20)
 * @param offset - Number of events to skip (default: 0)
 * @returns Promise with array of Event objects
 */
export async function getPopularWithFriendsEvents(
  userId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<Event[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.rpc("get_popular_with_friends", {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      console.error("Error fetching popular events with friends:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Map RPC response to Event[] format
    return (data as PopularEventResponse[]).map((item) => ({
      id: item.event_id,
      title: item.title,
      description: item.description || "",
      location: item.location || "",
      time: formatEventTime(item.start_time),
      attendees: item.interested_friends.map((friend) => ({
        id: friend.id,
        name: friend.username,
        avatarUrl: friend.avatar_url || undefined,
      })),
    }));
  } catch (error) {
    console.error("Unexpected error fetching popular events with friends:", error);
    return [];
  }
}
