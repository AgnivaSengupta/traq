import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import localFont from "next/font/local";
// import { getSession } from "@/lib/auth";
import { CircleCheckBig, File, Kanban, LogOut, Settings, User2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import Link from "next/link";


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
      <div className="container relative mx-auto flex h-16 items-center justify-between px-4 md:px-1">
        <a
          href="/"
          className={`text-3xl font-bold tracking-tight text-foreground ${headingFont.className}`}
        >
          traq
        </a>

        <nav className="hidden md:flex items-center gap-6 mx-auto">
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
                  <Avatar className="cursor-pointer">
                    <AvatarFallback>
                      <User2/>
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent  className="md:w-50 -translate-x-10">
                  <DropdownMenuLabel>
                    <div>
                      <p>{session.user.name}</p>
                      {/*<p>{session.user.name}</p>*/}
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem asChild>
                    <Link href='/dashboard'>
                      <Kanban />
                      Board 
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href='/applications'>
                      <CircleCheckBig />
                      Applications
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href='/resume'>
                      <File />
                      Resume
                    </Link>

                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href='settings'>
                      <Settings />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut />
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
