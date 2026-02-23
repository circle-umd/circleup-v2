"use client";

import { useEffect, useState } from "react";
import { Check, Clock, MapPin, User, X } from "lucide-react";
import type { Event } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventDetailsSheetProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onDismiss: () => void;
  isAlreadyAccepted?: boolean;
}

export function EventDetailsSheet({
  event,
  open,
  onOpenChange,
  onAccept,
  onDismiss,
  isAlreadyAccepted = false,
}: EventDetailsSheetProps) {
  const [isTabletOrLarger, setIsTabletOrLarger] = useState(false);

  useEffect(() => {
    // Check if screen is md (768px) or larger (iPad and up)
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    setIsTabletOrLarger(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsTabletOrLarger(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (!event) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Clean description by removing "Hosted by: ..." and "Additional Information can be found at: ..." patterns
  const cleanDescription = (description: string): string => {
    if (!description) return description;
    
    let cleaned = description;
    
    // Remove "Additional Information can be found at: [url]" pattern (case insensitive)
    // Matches with optional newlines/whitespace before, and handles URLs with various formats
    cleaned = cleaned.replace(
      /\n*\s*Additional\s+Information\s+can\s+be\s+found\s+at:\s*https?:\/\/[^\s\n]+/gi,
      ""
    );
    
    // Remove "Hosted by: [organization]" pattern (case insensitive)
    // Matches with optional newlines/whitespace before, and captures everything until end of line or next section
    cleaned = cleaned.replace(
      /\n*\s*Hosted\s+by:\s*[^\n]+/gi,
      ""
    );
    
    // Clean up any trailing newlines or whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  };

  const visibleAttendees = event.attendees.slice(0, 3);
  const remainingCount = event.attendees.length - visibleAttendees.length;

  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  const handleDismiss = () => {
    onDismiss();
    onOpenChange(false);
  };

  const content = (
    <>
      <ScrollArea className="mt-4 max-h-[calc(90vh-200px)]">
        <div className="space-y-6 pr-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {cleanDescription(event.description)}
            </p>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{event.location}</span>
            </div>
            {event.organizer && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0" />
                <span>{event.organizer.name}</span>
              </div>
            )}
          </div>
          {event.organizerName && (
            <div className="text-sm text-muted-foreground">
              <span>Hosted by: {event.organizerName}</span>
            </div>
          )}
          {event.url && (
            <div className="text-sm text-muted-foreground">
              <span>More info: </span>
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {event.url}
              </a>
            </div>
          )}
          {event.attendees.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Friends going:
              </span>
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
          )}
        </div>
      </ScrollArea>
      <div className="mt-6 flex flex-row gap-2 sm:justify-end">
        {isAlreadyAccepted ? (
          <div className="flex-1 sm:flex-initial">
            <Badge
              variant="secondary"
              className="flex h-10 w-full items-center justify-center gap-2 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 sm:w-auto sm:px-4"
            >
              <Check className="h-4 w-4" />
              Already Accepted
            </Badge>
          </div>
        ) : (
          <Button
            variant="secondary"
            className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950 sm:flex-initial"
            onClick={handleAccept}
          >
            <Check className="mr-2 h-4 w-4" />
            Accept
          </Button>
        )}
        <Button
          variant="outline"
          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 sm:flex-initial"
          onClick={handleDismiss}
        >
          <X className="mr-2 h-4 w-4" />
          Dismiss
        </Button>
      </div>
    </>
  );

  // Use Sheet (bottom drawer) on mobile, Dialog (centered) on tablet and larger
  if (isTabletOrLarger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] bg-card">
        <SheetHeader>
          <SheetTitle>{event.title}</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
