"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/events", icon: Home, label: "Home" },
    { href: "/friends", icon: Users, label: "Friends" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t bg-background p-4">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="icon"
                className={cn(
                  "h-10 w-10",
                  isActive && "bg-secondary",
                )}
                aria-label={item.label}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
