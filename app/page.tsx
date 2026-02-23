import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="h-[100dvh] w-[100vw] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Image Wrapper - spans the WHOLE screen */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/landing.PNG)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          width: '100vw',
          height: '100dvh',
        }}
      />
      
      {/* Circular Dimming Overlay - Dark Mode */}
      <div 
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0, 0, 0, 0.5) 70%)',
        }}
      />
      
      {/* Content with safe-area padding */}
      <div 
        className="flex flex-col items-center justify-center gap-8 max-w-md w-full relative z-10 font-sans p-6"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)',
          paddingLeft: 'calc(env(safe-area-inset-left) + 1.5rem)',
          paddingRight: 'calc(env(safe-area-inset-right) + 1.5rem)',
          transform: 'translateY(-10%)',
        }}
      >
        {/* Logo */}
        <div className="relative w-full max-w-[300px] aspect-square">
          <Image
            src="/circleup.png"
            alt="CircleUp Logo"
            fill
            className="object-contain invert"
            priority
          />
        </div>

        {/* Mission Statement */}
        <div className="text-center space-y-2 font-sans">
          <p className="text-3xl md:text-4xl lg:text-5xl font-medium text-white font-sans">
            Find your circle.
          </p>
        </div>

        {/* Login Button */}
        <Button 
          asChild 
          size="lg" 
          className="mt-4 bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/25 hover:border-white/40 text-lg font-semibold font-sans rounded-2xl shadow-2xl"
          style={{
            boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.37)',
          }}
        >
          <Link href="/auth/login" className="flex items-center gap-2 font-sans">
            Login
            <ChevronRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
