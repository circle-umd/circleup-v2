import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { hasEnvVars } from "@/lib/utils";

// Protected routes that require authentication
const protectedRoutes = ["/events", "/friends", "/profile"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Update the session first (this handles cookie refresh and session management)
  const response = await updateSession(request);

  // If it's a protected route, check authentication
  if (isProtectedRoute && hasEnvVars) {
    // Create a Supabase client to check auth status
    // We need to create a new client here to check auth, but cookies are already
    // handled by updateSession above
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Cookies are already handled by updateSession, but we need this
            // for the client to work properly
          },
        },
      },
    );

    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;

    // If no user, redirect to login with return URL
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
