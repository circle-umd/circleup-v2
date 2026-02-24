"use client";

import { useState } from "react";
import { Send, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { generateInviteLink } from "@/app/friends/invite";

interface InviteFriendsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteFriendsDialog({
  open,
  onOpenChange,
}: InviteFriendsDialogProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShareViaMessage = async () => {
    setIsGenerating(true);
    try {
      const { inviteUrl, error } = await generateInviteLink();
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to generate invite link.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      const shareText = `Join me on CircleUp! ${inviteUrl}`;

      if (navigator.share) {
        // Native share (mobile)
        try {
          await navigator.share({
            title: "Join me on CircleUp",
            text: shareText,
            url: inviteUrl,
          });
        } catch (shareError) {
          // User cancelled or error occurred - fallback to clipboard
          if ((shareError as Error).name !== "AbortError") {
            await navigator.clipboard.writeText(shareText);
            toast({
              title: "Copied!",
              description: "Invite message copied to clipboard. Paste it in your message app.",
            });
          }
        }
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied!",
          description: "Invite message copied to clipboard. Paste it in your message app.",
        });
      }
    } catch (error) {
      console.error("Error sharing invite:", error);
      toast({
        title: "Error",
        description: "Failed to share invite. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    setIsGenerating(true);
    try {
      const { inviteUrl, error } = await generateInviteLink();
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to generate invite link.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      await navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Invite link copied!",
        description: "Share this link with your friends.",
      });
    } catch (error) {
      console.error("Error copying invite link:", error);
      toast({
        title: "Error",
        description: "Failed to copy invite link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
          <DialogDescription>
            Share CircleUp with your friends. They'll automatically become your friend when they sign up.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {/* Option 1: Share via Message */}
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleShareViaMessage}
            disabled={isGenerating}
          >
            <Send className="h-4 w-4 mr-2" />
            Invite Through Message
          </Button>
          
          {/* Option 2: Copy Link */}
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleCopyLink}
            disabled={isGenerating}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Invite URL
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
