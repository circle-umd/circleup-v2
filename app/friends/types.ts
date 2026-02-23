export interface Friend {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  status: 'ACCEPTED' | 'PENDING';
}

export interface SearchResult {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  friendship_status: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED';
}
