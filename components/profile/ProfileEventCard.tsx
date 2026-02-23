"use client";

import { Clock, MapPin, UserCircle } from "lucide-react";
import type { Event } from "@/app/events/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProfileEventCardProps {
  event: Event;
  onClick?: () => void;
}

export function ProfileEventCard({
  event,
  onClick,
}: ProfileEventCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card
      className={cn(
        "relative",
        onClick && "cursor-pointer transition-shadow hover:shadow-md",
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{event.title}</CardTitle>
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
          {(event.organizer || event.organizerName) && (
            <div className="flex items-center gap-2">
              <UserCircle className="h-4 w-4 shrink-0" />
              <span>{event.organizer?.name || event.organizerName || ""}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
