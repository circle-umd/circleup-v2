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
