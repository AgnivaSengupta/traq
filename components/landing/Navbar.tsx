import { Button } from "@/components/ui/button";

const navLinks = ["Home", "Features", "How It Works", "Pricing", "Testimonials", "FAQ"];

interface NavbarProps {
  onGetStarted?: () => void;
}

type AuthType = "signin" | "signup";

interface HeroSectionProps {
  handleOpenAuth: (type: AuthType) => void;
}

const Navbar = ({ handleOpenAuth }: HeroSectionProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">

        <a href="/" className="text-xl font-bold tracking-tight text-foreground">
          traq
        </a>

        <nav className="hidden items-center gap-6 md:flex translate-x-15">
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
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => handleOpenAuth('signin')}>
            Login
          </Button>
          <Button variant='outline' size="sm" className="rounded-md px-5" onClick={() => handleOpenAuth('signup')}>
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
