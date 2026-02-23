"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, X, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import {
  getFriends,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
} from "./data";
import type { Friend, SearchResult } from "./types";

function getFullName(firstName: string | null, lastName: string | null): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  return firstName || lastName || "Unknown";
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0).toUpperCase() || "";
  const last = lastName?.charAt(0).toUpperCase() || "";
  if (first && last) {
    return `${first}${last}`;
  }
  return first || last || "?";
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load friends on mount
  useEffect(() => {
    async function loadFriends() {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          toast({
            title: "Error",
            description: "You must be logged in to view friends.",
            variant: "destructive",
          });
          return;
        }

        setCurrentUserId(user.id);
        const friendsList = await getFriends(user.id);
        setFriends(friendsList);
      } catch (error) {
        console.error("Error loading friends:", error);
        toast({
          title: "Error",
          description: "Failed to load friends. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingFriends(false);
      }
    }
    loadFriends();
  }, [toast]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || !currentUserId) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchUsers(searchQuery, currentUserId);
        // Filter out already accepted friends from search results
        const filteredResults = results.filter(
          (result) => result.friendship_status !== "ACCEPTED",
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentUserId]);

  const handleSendFriendRequest = async (targetUserId: string) => {
    try {
      const { error } = await sendFriendRequest(targetUserId);

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to send friend request.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent.",
      });

      // Update search results to reflect pending status
      setSearchResults((prev) =>
        prev.map((result) =>
          result.id === targetUserId
            ? { ...result, friendship_status: "PENDING_SENT" }
            : result,
        ),
      );
    } catch (error) {
      console.error("Unexpected error sending friend request:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptFriendRequest = async (requesterUserId: string) => {
    try {
      const { error } = await acceptFriendRequest(requesterUserId);

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to accept friend request.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Friend request accepted",
        description: "You are now friends!",
      });

      // Remove from search results and refresh friends list
      setSearchResults((prev) =>
        prev.filter((result) => result.id !== requesterUserId),
      );

      // Reload friends list
      if (currentUserId) {
        const friendsList = await getFriends(currentUserId);
        setFriends(friendsList);
      }
    } catch (error) {
      console.error("Unexpected error accepting friend request:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const { error } = await removeFriend(friendId);

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to remove friend.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setFriends((prev) => prev.filter((f) => f.id !== friendId));

      toast({
        title: "Friend removed",
        description: "Friend has been removed successfully.",
      });
    } catch (error) {
      console.error("Unexpected error removing friend:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <ScrollArea className="flex-1 px-4 pt-4 pb-24">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Add a new friend"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Search Results */}
          {searchQuery.trim() && (
            <section>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Search Results
              </h3>
              {isSearching ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Searching...
                </p>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((result) => {
                    const fullName = getFullName(
                      result.first_name,
                      result.last_name,
                    );
                    const initials = getInitials(
                      result.first_name,
                      result.last_name,
                    );
                    const displayName =
                      fullName !== "Unknown"
                        ? fullName
                        : result.username || "Unknown User";

                    return (
                      <div
                        key={result.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <Avatar className="h-10 w-10">
                          {result.avatar_url ? (
                            <AvatarImage
                              src={result.avatar_url}
                              alt={displayName}
                            />
                          ) : null}
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{displayName}</p>
                          {result.username && (
                            <p className="text-sm text-muted-foreground">
                              @{result.username}
                            </p>
                          )}
                        </div>
                        {result.friendship_status === "NONE" && (
                          <Button
                            size="sm"
                            onClick={() => handleSendFriendRequest(result.id)}
                          >
                            Add
                          </Button>
                        )}
                        {result.friendship_status === "PENDING_SENT" && (
                          <span className="text-sm text-muted-foreground">
                            Pending
                          </span>
                        )}
                        {result.friendship_status === "PENDING_RECEIVED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcceptFriendRequest(result.id)}
                          >
                            Accept
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No users found.
                </p>
              )}
            </section>
          )}

          {/* Your Friends Section */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Your Friends</h2>
            </div>
            {isLoadingFriends ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Loading friends...
              </p>
            ) : friends.length > 0 ? (
              <div className="space-y-2">
                {friends.map((friend) => {
                  const fullName = getFullName(
                    friend.first_name,
                    friend.last_name,
                  );
                  const initials = getInitials(
                    friend.first_name,
                    friend.last_name,
                  );
                  const displayName =
                    fullName !== "Unknown"
                      ? fullName
                      : friend.username || "Unknown User";

                  return (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <Avatar className="h-10 w-10">
                        {friend.avatar_url ? (
                          <AvatarImage
                            src={friend.avatar_url}
                            alt={displayName}
                          />
                        ) : null}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{displayName}</p>
                        {friend.username && (
                          <p className="text-sm text-muted-foreground">
                            @{friend.username}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No friends yet. Search above to add friends!
              </p>
            )}
          </section>
        </div>
      </ScrollArea>
      <BottomNav />
    </div>
  );
}
