import type { Event } from "./types";

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
 * Currently returns mock data, but can be easily swapped to call real APIs.
 */
export async function getForYouEvents(): Promise<Event[]> {
  // Simulate async data fetch
  return Promise.resolve(mockForYouEvents);
}

export async function getPopularEvents(): Promise<Event[]> {
  // Simulate async data fetch
  return Promise.resolve(mockPopularEvents);
}
