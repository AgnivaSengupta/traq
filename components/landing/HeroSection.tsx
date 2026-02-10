import { Check, ChevronRight, Play, Sparkles } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const checks = [
  "Easy Application Tracking",
  "Resume builder",
  "Customized AI resume checker",
];

type AuthType = "signin" | "signup";

interface HeroSectionProps {
  handleOpenAuth: (type: AuthType) => void;
}

export const HeroSection = ({ handleOpenAuth }: HeroSectionProps) => {
  return (
    <section className="container mx-auto px-4 py-30">
      <div className="flex flex-col items-center mx-auto text-center max-w-4xl">
        <Badge
          variant="secondary"
          className="mb-6 rounded-md px-4 py-2 text-base border border-border font-medium font-serif"
        >
          <Sparkles size={32} strokeWidth={1.5} fill="#000000" />
          Resume feature coming soon
        </Badge>

        {/*<h1 className="max-w-3xl text-6xl font-serif leading-[1.1] tracking-wider text-foreground">Effortless Job Tracking and Resume Building Made Simple</h1>*/}
        <h1 className="max-w-3xl text-6xl font-serif leading-[1.1] tracking-wider text-foreground">
          A Better Way To Track Your Job Applications
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground font-dm-sans">
          Organize your job search, build tailored resumes, and land interviews
          faster — all in one beautifully simple platform.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {checks.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-sm text-muted-foreground font-dm-sans"
            >
              <div className="border border-zinc-300 p-0.5 rounded bg-zinc-100/50">
                <Check className="h-3 w-3 text-foreground" />
              </div>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            className="rounded-md px-8 text-base tracking-wider font-serif cursor-pointer"
            onClick={() => handleOpenAuth("signup")}
          >
            Get Started for Free
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-md px-8 text-base tracking-wider font-serif cursor-pointer"
          >
            <Play className="mr-1 h-4 w-4" />
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
};
