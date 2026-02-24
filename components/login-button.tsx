import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function LoginButton() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Set login button destination based on authentication status
  const loginHref = user ? "/events" : "/auth/login";

  return (
    <Button 
      asChild 
      size="lg" 
      className="mt-4 bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/25 hover:border-white/40 text-lg font-semibold font-sans rounded-2xl shadow-2xl"
      style={{
        boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.37)',
      }}
    >
      <Link href={loginHref} className="flex items-center gap-2 font-sans">
        Login
        <ChevronRight className="h-5 w-5" />
      </Link>
    </Button>
  );
}
