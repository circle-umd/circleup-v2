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
