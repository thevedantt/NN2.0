import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DoctorModel from "@/components/DoctorModel";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between mx-auto px-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">NeuraNet</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/chat-ai">
              <Button variant="ghost">AI Companion</Button>
            </Link>
            <Link href="/doctors">
              <Button>Find a Doctor</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-4 md:py-8 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Your Mental Health Companion
            </h1>
            <p className="text-muted-foreground text-lg max-w-[600px] mx-auto md:mx-0">
              Connect with empathetic AI support, professional doctors, and a community that cares.
              Experience the future of mental wellness.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link href="/chat-ai">
                <Button size="lg" className="h-12 px-8">Start Chatting</Button>
              </Link>
              <Link href="/doctors">
                <Button variant="outline" size="lg" className="h-12 px-8">Book Consultation</Button>
              </Link>
            </div>
          </div>

          {/* 3D Model Embed */}
          <div className="flex-1 w-full max-w-[600px] aspect-square relative">
            <DoctorModel />
          </div>
        </section>

        <div className="container mx-auto px-4 pb-8 text-center text-xs text-muted-foreground">
          <p>
            3D Model based on "Doctor - Sketchfab Weekly" by BrushDip
          </p>
        </div>

      </main>
    </div>
  );
}
