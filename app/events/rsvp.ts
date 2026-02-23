import { createClient } from "@/lib/supabase/client";
import type { RsvpStatus, VisibilityStatus } from "./types";

/**
 * Creates or updates an RSVP for a user and event.
 * @param eventId - The ID of the event
 * @param userId - The ID of the user
 * @param status - The RSVP status ('INTERESTED' or 'HIDDEN')
 * @returns Promise with error object (null if successful)
 */
export async function createRsvp(
  eventId: string,
  userId: string,
  status: 'INTERESTED' | 'HIDDEN'
): Promise<{ error: Error | null }> {
  try {
    const supabase = createClient();
    
    // Set visibility based on status
    // INTERESTED = PUBLIC (visible to others)
    // HIDDEN = PRIVATE (not visible to others)
    const visibility: VisibilityStatus = status === 'INTERESTED' ? 'PUBLIC' : 'PRIVATE';
    
    const { error } = await supabase
      .from('event_rsvps')
      .upsert({
        user_id: userId,
        event_id: eventId,
        status: status,
        visibility: visibility,
      });

    if (error) {
      console.error('Error creating RSVP:', error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error creating RSVP:', error);
    return { 
      error: error instanceof Error 
        ? error 
        : new Error('An unexpected error occurred while saving your RSVP')
    };
  }
}

/**
 * Checks if a user has already RSVP'd to an event with status 'INTERESTED' or 'GOING'.
 * @param eventId - The ID of the event
 * @param userId - The ID of the user
 * @returns Promise with isAccepted boolean and error object (null if successful)
 */
export async function checkRsvpStatus(
  eventId: string,
  userId: string
): Promise<{ isAccepted: boolean; error: Error | null }> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('event_rsvps')
      .select('status')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .in('status', ['INTERESTED', 'GOING'])
      .maybeSingle();

    if (error) {
      console.error('Error checking RSVP status:', error);
      return { isAccepted: false, error: new Error(error.message) };
    }

    // If data exists, user has already accepted
    return { isAccepted: data !== null, error: null };
  } catch (error) {
    console.error('Unexpected error checking RSVP status:', error);
    return { 
      isAccepted: false,
      error: error instanceof Error 
        ? error 
        : new Error('An unexpected error occurred while checking RSVP status')
    };
  }
}
