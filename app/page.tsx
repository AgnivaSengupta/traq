"use client";

import Authform from "@/components/landing/AuthForm";
// import DashboardPreview from "@/components/landing/DashboardPreview";
import FeaturesSection from "@/components/landing/FeaturedSection";
import Footer from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import Navbar from "@/components/landing/Navbar";
import Image from "next/image";
import { useState } from "react";

type AuthType = "signup" | "signin";

export default function Home() {
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<AuthType>("signup");

  const handleOpenAuth = (type: AuthType) => {
    setAuthType(type);
    setAuthOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50">
      <Navbar handleOpenAuth={handleOpenAuth} />
      <main className="flex-1">
        <HeroSection handleOpenAuth={handleOpenAuth} />
        <Image
          src="/preview2.png" 
          alt="Job Board Dashboard Preview"
          width={1200}
          height={800}
          priority
        />
        <FeaturesSection />
        <Footer />
      </main>
      <Authform
        open={isAuthOpen}
        onOpenChange={setAuthOpen}
        authType={authType}
        setAuthType={setAuthType}
      />
    </div>
  );
}
