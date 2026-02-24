import { createClient } from "@/lib/supabase/client";

export async function generateInviteLink(): Promise<{ 
  inviteCode: string; 
  inviteUrl: string; 
  error: Error | null 
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('create_invite');
    
    if (error) {
      return { inviteCode: '', inviteUrl: '', error: new Error(error.message) };
    }
    
    if (!data || !data.invite_code) {
      return { 
        inviteCode: '', 
        inviteUrl: '', 
        error: new Error('Failed to generate invite code') 
      };
    }
    
    // Construct the full invite URL using window.location.origin
    const inviteUrl = `${window.location.origin}/auth/sign-up?invite=${data.invite_code}`;
    
    return {
      inviteCode: data.invite_code,
      inviteUrl: inviteUrl,
      error: null
    };
  } catch (error) {
    return {
      inviteCode: '',
      inviteUrl: '',
      error: error instanceof Error ? error : new Error('Failed to generate invite')
    };
  }
}
