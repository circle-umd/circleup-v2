export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  time: string;
  attendees: User[];
};

// RSVP-related types
export type RsvpStatus = 'INTERESTED' | 'GOING' | 'MAYBE' | 'INVITED' | 'HIDDEN';
export type VisibilityStatus = 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';

export interface EventRsvp {
  user_id: string;
  event_id: string;
  status: RsvpStatus;
  visibility: VisibilityStatus;
  created_at: string;
  updated_at: string;
}

// RPC Return Types
export interface InterestedFriend {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

export interface PopularEventResponse {
  event_id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  friend_rsvp_count: number;
  interested_friends: InterestedFriend[];
}
