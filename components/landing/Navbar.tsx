import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import localFont from "next/font/local";
// import { getSession } from "@/lib/auth";
import { User2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";


const headingFont = localFont({
  src:"../../app/fonts/orange.otf",
})

const navLinks = [
  "Home",
  "Features",
  "How It Works",
  "Pricing",
  "Testimonials",
  "FAQ",
];

interface NavbarProps {
  onGetStarted?: () => void;
}

type AuthType = "signin" | "signup";

interface HeroSectionProps {
  handleOpenAuth: (type: AuthType) => void;
}

const Navbar = ({ handleOpenAuth }: HeroSectionProps) => {
  const { data: session, isPending } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container relative mx-auto flex h-16 items-center justify-between">
        <a
          href="/"
          className={`text-3xl font-bold tracking-tight text-foreground ${headingFont.className}`}
        >
          traq
        </a>

        <nav className="hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <User2 />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuLabel>
                    <div>
                      <p>{session.user.name}</p>
                      {/*<p>{session.user.name}</p>*/}
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem onClick={() => signOut()}>
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => handleOpenAuth("signin")}
              >
                Login
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-md px-5"
                onClick={() => handleOpenAuth("signup")}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
