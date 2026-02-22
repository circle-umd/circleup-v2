import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile } from "@/app/profile/types";

interface ProfileDisplayProps {
  profile: Profile | null;
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0).toUpperCase() || "";
  const last = lastName?.charAt(0).toUpperCase() || "";
  if (first && last) return `${first}${last}`;
  if (first) return first;
  if (last) return last;
  return "?";
}

function getFullName(firstName: string | null, lastName: string | null): string {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return "Not set";
}

export function ProfileDisplay({ profile }: ProfileDisplayProps) {
  if (!profile) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Profile not found. Please complete your profile setup.
      </div>
    );
  }

  const fullName = getFullName(profile.first_name, profile.last_name);
  const initials = getInitials(profile.first_name, profile.last_name);

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-center">
            <Avatar className="h-32 w-32">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={fullName} />
              ) : null}
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Info Section */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">{fullName}</h2>
          {profile.username ? (
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Username not set</p>
          )}
        </CardHeader>
      </Card>

      {/* Bio Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">About</h3>
        </CardHeader>
        <CardContent>
          {profile.bio ? (
            <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No bio available yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
