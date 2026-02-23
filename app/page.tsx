import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/landing.PNG)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Circular Dimming Overlay - Light Mode */}
      <div 
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(255, 255, 255, 0.5) 70%)',
        }}
      />
      {/* Circular Dimming Overlay - Dark Mode */}
      <div 
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0, 0, 0, 0.5) 70%)',
        }}
      />
      
      {/* Content */}
      <div className="flex flex-col items-center gap-8 max-w-md w-full relative z-10 font-sans">
        {/* Logo */}
        <div className="relative w-full max-w-[300px] aspect-square">
          <Image
            src="/circleup.png"
            alt="CircleUp Logo"
            fill
            className="object-contain dark:invert"
            priority
          />
        </div>

        {/* Mission Statement */}
        <div className="text-center space-y-2 font-sans">
          <p className="text-3xl md:text-4xl lg:text-5xl font-medium text-white font-sans">
            Find your circle!
          </p>
          <p className="text-lg md:text-xl lg:text-2xl text-white font-sans">
            A student-run initiative at the University of Maryland
          </p>
        </div>

        {/* Login Button */}
        <Button 
          asChild 
          size="lg" 
          className="mt-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 text-lg font-semibold font-sans"
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
