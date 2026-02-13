"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

const RegisterForm = ({
  open,
  onOpenChange,
  onSwitchToLogin,
}: RegisterDialogProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await signUp.email({
          name,
          email,
          password,
        });

        if (result?.error) {
          setError(result.error.message ?? "Failed to signup");
          return;
        }

        onOpenChange(false);
        router.refresh();
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      }
    });
    // Registration logic placeholder
    // console.log("Register:", { name, email, password });
    // onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create your account
          </DialogTitle>
          <DialogDescription>
            Start tracking your job applications today.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full"
          >
            {isPending ? "Creating account..." : "Get Started"}
          </Button>

          {error && (
            <div className="rounded-md bg-destructive/20 text-sm p-2 px-4 text-destructive">
              {error}
            </div>
          )}

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToLogin();
              }}
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By signing up, you agree to our Terms and Privacy Policy.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterForm;
