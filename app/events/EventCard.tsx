"use client";

import { Check, Clock, MapPin, X } from "lucide-react";
import type { Event } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
  variant?: "default" | "popular";
}

export function EventCard({
  event,
  onAccept,
  onDismiss,
  variant = "default",
}: EventCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const visibleAttendees = event.attendees.slice(0, 3);
  const remainingCount = event.attendees.length - visibleAttendees.length;

  return (
    <Card
      className={cn(
        "relative",
        variant === "popular" && "border-primary/20",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex-1 pr-2">{event.title}</CardTitle>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={() => onAccept(event.id)}
              aria-label="Accept event"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => onDismiss(event.id)}
              aria-label="Dismiss event"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{event.location}</span>
          </div>
        </div>
      </CardContent>
      {event.attendees.length > 0 && (
        <CardFooter className="pt-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Friends going:</span>
            <div className="flex -space-x-2">
              {visibleAttendees.map((attendee) => (
                <Avatar
                  key={attendee.id}
                  className="h-7 w-7 border-2 border-background"
                >
                  {attendee.avatarUrl ? (
                    <AvatarImage
                      src={attendee.avatarUrl}
                      alt={attendee.name}
                    />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {getInitials(attendee.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {remainingCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                +{remainingCount}
              </Badge>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
