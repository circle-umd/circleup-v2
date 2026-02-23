import { createClient } from "@/lib/supabase/client";
import type { Friend, SearchResult } from "./types";

// Local types for the query result
interface ProfileData {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface FriendshipQueryResult {
  friend_id: string;
  status: string;
  profiles: ProfileData | ProfileData[] | null;
}

/**
 * Fetches all accepted friends for a user
 * Uses the double-row architecture: query where user_id = userId
 * @param userId - The user's ID
 * @returns Array of Friend objects
 */
export async function getFriends(userId: string): Promise<Friend[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("friendships")
      .select(
        `
        friend_id,
        status,
        profiles:friend_id (
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `,
      )
      .eq("user_id", userId)
      .eq("status", "ACCEPTED");

    if (error) {
      console.error("Error fetching friends:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Map the data to Friend format
    const friends: Friend[] = [];
    for (const item of data as FriendshipQueryResult[]) {
      const profile = item.profiles;
      
      // Handle both array and object cases
      if (Array.isArray(profile)) {
        // If it's an array, take the first profile
        if (profile.length > 0) {
          const profileData = profile[0];
          friends.push({
            id: profileData.id,
            username: profileData.username,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            avatar_url: profileData.avatar_url,
            status: item.status as "ACCEPTED",
          });
        }
      } else if (profile && typeof profile === "object") {
        // If it's a single object
        friends.push({
          id: profile.id,
          username: profile.username,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          status: item.status as "ACCEPTED",
        });
      }
    }
    return friends;
  } catch (error) {
    console.error("Unexpected error fetching friends:", error);
    return [];
  }
}

/**
 * Searches for users by username, first name, or last name
 * Excludes the current user and shows friendship status
 * @param query - Search query string
 * @param currentUserId - The current user's ID
 * @returns Array of SearchResult objects
 */
export async function searchUsers(
  query: string,
  currentUserId: string,
): Promise<SearchResult[]> {
  try {
    if (!query.trim()) {
      return [];
    }

    const supabase = createClient();
    const searchPattern = `%${query.trim()}%`;

    // First, get all matching profiles
    // Use separate queries and combine results, or use textSearch if available
    // For now, we'll query each field separately and combine unique results
    const [usernameResults, firstNameResults, lastNameResults] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, first_name, last_name, avatar_url")
        .neq("id", currentUserId)
        .ilike("username", searchPattern)
        .limit(20),
      supabase
        .from("profiles")
        .select("id, username, first_name, last_name, avatar_url")
        .neq("id", currentUserId)
        .ilike("first_name", searchPattern)
        .limit(20),
      supabase
        .from("profiles")
        .select("id, username, first_name, last_name, avatar_url")
        .neq("id", currentUserId)
        .ilike("last_name", searchPattern)
        .limit(20),
    ]);

    // Combine and deduplicate results
    const allProfiles = [
      ...(usernameResults.data || []),
      ...(firstNameResults.data || []),
      ...(lastNameResults.data || []),
    ];
    const uniqueProfiles = Array.from(
      new Map(allProfiles.map((p) => [p.id, p])).values(),
    ).slice(0, 20);

    const profilesError =
      usernameResults.error || firstNameResults.error || lastNameResults.error;
    const profiles = uniqueProfiles;

    if (profilesError) {
      console.error("Error searching profiles:", profilesError);
      return [];
    }

    if (!profiles || profiles.length === 0) {
      return [];
    }

    // Get friendship statuses for all found profiles
    const profileIds = profiles.map((p) => p.id);
    if (profileIds.length === 0) {
      return [];
    }

    // Query friendships where current user is involved with any of the found profiles
    const { data: friendships, error: friendshipsError } = await supabase
      .from("friendships")
      .select("user_id, friend_id, status")
      .eq("user_id", currentUserId)
      .in("friend_id", profileIds);
    
    // Also get friendships where found profiles initiated with current user
    const { data: reverseFriendships } = await supabase
      .from("friendships")
      .select("user_id, friend_id, status")
      .eq("friend_id", currentUserId)
      .in("user_id", profileIds);

    const allFriendships = [
      ...(friendships || []),
      ...(reverseFriendships || []),
    ];

    if (friendshipsError) {
      console.error("Error fetching friendships:", friendshipsError);
      // Continue without friendship status
    }

    // Map profiles to SearchResult with friendship status
    return profiles.map((profile) => {
      let friendshipStatus: SearchResult["friendship_status"] = "NONE";

      if (allFriendships) {
        const friendship = allFriendships.find(
          (f) =>
            (f.user_id === currentUserId && f.friend_id === profile.id) ||
            (f.user_id === profile.id && f.friend_id === currentUserId),
        );

        if (friendship) {
          if (friendship.status === "ACCEPTED") {
            friendshipStatus = "ACCEPTED";
          } else if (friendship.status === "PENDING") {
            if (friendship.user_id === currentUserId) {
              friendshipStatus = "PENDING_SENT";
            } else {
              friendshipStatus = "PENDING_RECEIVED";
            }
          }
        }
      }

      return {
        id: profile.id,
        username: profile.username,
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: profile.avatar_url,
        friendship_status: friendshipStatus,
      };
    });
  } catch (error) {
    console.error("Unexpected error searching users:", error);
    return [];
  }
}

/**
 * Sends a friend request to a target user
 * @param targetUserId - The ID of the user to send the request to
 * @returns Error object if request failed, null on success
 */
export async function sendFriendRequest(
  targetUserId: string,
): Promise<{ error: Error | null }> {
  try {
    const supabase = createClient();

    const { error } = await supabase.rpc("send_friend_request", {
      p_target_id: targetUserId,
    });

    if (error) {
      console.error("Error sending friend request:", error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error("Unexpected error sending friend request:", error);
    return {
      error:
        error instanceof Error
          ? error
          : new Error("Failed to send friend request"),
    };
  }
}

/**
 * Accepts a friend request from a requester
 * @param requesterUserId - The ID of the user who sent the request
 * @returns Error object if acceptance failed, null on success
 */
export async function acceptFriendRequest(
  requesterUserId: string,
): Promise<{ error: Error | null }> {
  try {
    const supabase = createClient();

    const { error } = await supabase.rpc("accept_friend_request", {
      p_requester_id: requesterUserId,
    });

    if (error) {
      console.error("Error accepting friend request:", error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error("Unexpected error accepting friend request:", error);
    return {
      error:
        error instanceof Error
          ? error
          : new Error("Failed to accept friend request"),
    };
  }
}

/**
 * Removes a friend (unfriends)
 * @param friendId - The ID of the friend to remove
 * @returns Error object if removal failed, null on success
 */
export async function removeFriend(
  friendId: string,
): Promise<{ error: Error | null }> {
  try {
    const supabase = createClient();

    const { error } = await supabase.rpc("remove_friend", {
      p_friend_id: friendId,
    });

    if (error) {
      console.error("Error removing friend:", error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error("Unexpected error removing friend:", error);
    return {
      error:
        error instanceof Error ? error : new Error("Failed to remove friend"),
    };
  }
}
