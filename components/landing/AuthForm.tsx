"use client";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type AuthType = "signup" | "signin";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authType: AuthType;
  setAuthType: (type: AuthType) => void;
}

export default function Authform({
  open,
  onOpenChange,
  authType,
  setAuthType,
}: AuthDialogProps) {
  return authType === "signup" ? (
    <RegisterForm
      open={open}
      onOpenChange={onOpenChange}
      onSwitchToLogin={() => setAuthType("signin")}
    />
  ) : (
    <LoginForm
      open={open}
      onOpenChange={onOpenChange}
      onSwitchToSignup={() => setAuthType("signup")}
    />
  );
}
