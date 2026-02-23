"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import type { Profile } from "@/app/profile/types";

interface ProfileEditFormProps {
  profile: Profile | null;
  userId: string;
  onSave: () => void;
  onCancel: () => void;
}

interface ValidationErrors {
  username?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
}

export function ProfileEditForm({
  profile,
  userId,
  onSave,
  onCancel,
}: ProfileEditFormProps) {
  const { toast } = useToast();
  const [username, setUsername] = useState(profile?.username || "");
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = (value: string): string | undefined => {
    if (!value.trim()) {
      return undefined; // Username is optional
    }
    if (value.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (value.length > 30) {
      return "Username must be at most 30 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return undefined;
  };

  const validateField = (
    field: string,
    value: string,
    maxLength: number,
  ): string | undefined => {
    if (value.length > maxLength) {
      return `${field} must be at most ${maxLength} characters`;
    }
    return undefined;
  };

  const checkUsernameUniqueness = async (
    usernameValue: string,
  ): Promise<boolean> => {
    if (!usernameValue.trim()) return true;
    if (usernameValue === profile?.username) return true; // Same username, no need to check

    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", usernameValue)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows found, which is what we want
      return false;
    }

    return !data; // Return true if username is available (no data found)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate all fields
    const newErrors: ValidationErrors = {};

    const usernameError = validateUsername(username);
    if (usernameError) {
      newErrors.username = usernameError;
    }

    const firstNameError = validateField("First name", firstName, 100);
    if (firstNameError) {
      newErrors.first_name = firstNameError;
    }

    const lastNameError = validateField("Last name", lastName, 100);
    if (lastNameError) {
      newErrors.last_name = lastNameError;
    }

    const bioError = validateField("Bio", bio, 500);
    if (bioError) {
      newErrors.bio = bioError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Check username uniqueness if username is provided and changed
    if (username.trim() && username !== profile?.username) {
      const isUnique = await checkUsernameUniqueness(username.trim());
      if (!isUnique) {
        setErrors({ username: "This username is already taken" });
        setIsLoading(false);
        return;
      }
    }

    // Save to Supabase
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          username: username.trim() || null,
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
          bio: bio.trim() || null,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      onSave();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Username</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) {
                  setErrors({ ...errors, username: undefined });
                }
              }}
              onBlur={() => {
                const error = validateUsername(username);
                if (error) {
                  setErrors({ ...errors, username: error });
                }
              }}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional. 3-30 characters, letters, numbers, and underscores only.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Name Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Name</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (errors.first_name) {
                  setErrors({ ...errors, first_name: undefined });
                }
              }}
              onBlur={() => {
                const error = validateField("First name", firstName, 100);
                if (error) {
                  setErrors({ ...errors, first_name: error });
                }
              }}
            />
            {errors.first_name && (
              <p className="text-sm text-destructive">{errors.first_name}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (errors.last_name) {
                  setErrors({ ...errors, last_name: undefined });
                }
              }}
              onBlur={() => {
                const error = validateField("Last name", lastName, 100);
                if (error) {
                  setErrors({ ...errors, last_name: error });
                }
              }}
            />
            {errors.last_name && (
              <p className="text-sm text-destructive">{errors.last_name}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">About</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                if (errors.bio) {
                  setErrors({ ...errors, bio: undefined });
                }
              }}
              onBlur={() => {
                const error = validateField("Bio", bio, 500);
                if (error) {
                  setErrors({ ...errors, bio: error });
                }
              }}
              rows={5}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional. Max 500 characters. {bio.length}/500
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
