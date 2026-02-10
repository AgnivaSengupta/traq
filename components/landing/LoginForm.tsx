"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/actions/auth-actions";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignup: () => void;
}

const LoginForm = ({
  open,
  onOpenChange,
  onSwitchToSignup,
}: RegisterDialogProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // Registration logic placeholder
  //   console.log("Register:", { name, email, password });
  //   onOpenChange(false);
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        // Call your Server Action
        await signIn(email, password);

        // If no error thrown:
        onOpenChange(false);
        router.refresh(); // Crucial: updates the Navbar to show "Sign Out"
        router.push("/dashboard");
      } catch (err: any) {
        setError("Invalid email or password");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Login to your account
          </DialogTitle>
          {/*<DialogDescription>
            Start tracking your job applications today.
          </DialogDescription>*/}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full rounded-full">
            {isPending ? "Signing In..." : "Log In"}
          </Button>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              Don't have an account? Create one{" "}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToSignup();
              }}
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginForm;
