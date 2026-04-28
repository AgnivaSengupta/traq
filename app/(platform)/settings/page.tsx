"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useRef, useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient, useSession } from "@/lib/auth-client";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { getPublicFileUrl } from "@/lib/actions/upload";
import { updateProfilePicture, signOutOtherSessions } from "@/lib/actions/auth-actions";
import { useRouter } from "next/navigation";

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Agniva";

function getInitials(name?: string | null) {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "A";
}

export default function SettingsPage() {
  
  const { data: sessionData } = useSession();
  const sessionUser = sessionData?.user;
    
  const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);
  const [sessionActionMessage, setSessionActionMessage] = useState("");

  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);
  const [isNameSaving, setIsNameSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, error: uploadError } = useFileUpload();

  const displayName = sessionUser?.name || "";
  const email = sessionUser?.email || "agniva@example.com";
  const displayAvatar = avatarUrl || sessionUser?.profilePic || sessionUser?.image || DEFAULT_AVATAR;
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const nameParts = displayName.split(" ");
  const [firstName, lastName] = [
    nameParts[0] || "",
    nameParts.slice(1).join(" ") || "",
  ];
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  
  useEffect(() => {
      if (sessionUser?.name) {
        const parts = sessionUser.name.trim().split(" ");
        setFName(parts[0] || "");
        setLName(parts.slice(1).join(" ") || "");
      }
    }, [sessionUser?.name]);
  
  const handleNameChange = async () => {
    // e.preventDefault();
    setIsNameSaving(true);
    const fullName = `${fName} ${lName}`.trim();
    try {
      const {data, error } = await authClient.updateUser(
       { name: fullName,}
      )
      
      if (error) {
        console.error("Update failed:", error.message);
      } else {
        console.log("Name updated successfully:", data);
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsNameSaving(false);
      // await authClient.getSession();
    }
  };

  const handlePasswordChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    setIsPasswordLoading(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setPasswordError(error.message || "Failed to change password");
        return;
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsPasswordDialogOpen(false);
    } catch {
      setPasswordError("An unexpected error occurred.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleAvatarSelection = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please upload an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Please choose an image under 2MB.");
      event.target.value = "";
      return;
    }

    setAvatarError("");
    setAvatarSuccess("");
    setIsAvatarSaving(true);

    try {
      const fileKey = await uploadFile(file);

      if (!fileKey) {
        setAvatarError("Upload failed. Please try again.");
        return;
      }

      const publicUrlResult = await getPublicFileUrl(fileKey);

      if (!publicUrlResult.success || !publicUrlResult.url) {
        setAvatarError(
          publicUrlResult.error || "Could not build a public image URL.",
        );
        return;
      }

      const updateResult = await updateProfilePicture(publicUrlResult.url);

      if (!updateResult.success) {
        setAvatarError(updateResult.error || "Failed to save your profile picture.");
        return;
      }

      setAvatarUrl(publicUrlResult.url);
      setAvatarSuccess("Profile picture updated.");
      setIsAvatarDialogOpen(false);
      await authClient.getSession();
    } finally {
      setIsAvatarSaving(false);
      event.target.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarError("");
    setAvatarSuccess("");
    setIsAvatarSaving(true);

    try {
      const updateResult = await updateProfilePicture("");

      if (!updateResult.success) {
        setAvatarError(updateResult.error || "Failed to remove your profile picture.");
        return;
      }

      setAvatarUrl("");
      setAvatarSuccess("Profile picture removed.");
      await authClient.getSession();
    } finally {
      setIsAvatarSaving(false);
    }
  };

  
  const handleSignOutOtherSessions = async () => {
    setSessionActionMessage("");
    setIsSigningOutOthers(true);
    
    try{
      const result = await signOutOtherSessions();
      if (result.success) {
        const deletedCount =
          typeof result.deletedCount === "number" ? result.deletedCount : 0;
        setSessionActionMessage(
          deletedCount > 0
            ? `Signed out ${deletedCount} other session${deletedCount === 1 ? "" : "s"}.`
            : "No other active sessions were found.",
        );
      } else {
        setSessionActionMessage(result.error || "Failed to sign out other sessions.");
      }
    } catch (err) {
      setSessionActionMessage(err instanceof Error ? err.message : "Failed to sign out other sessions.");
    } finally {
      setIsSigningOutOthers(false);
    }
  };
  

  return (
    <div className="flex h-screen flex-1 flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-5 py-3">
        <span className="ml-3 text-2xl font-serif tracking-wider">Settings</span>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-8 py-10 sm:px-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mb-10">
          <h1 className="font-serif text-3xl tracking-wide text-foreground">
            Account Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Manage your profile, secure your account, and control the few settings
            that matter for using traq day to day.
          </p>
        </div>

        <div className="space-y-12">
          <section className="mb-12">
            <h2 className="mb-12 text-xl font-serif font-semibold">Profile</h2>

            <div className="relative mb-24 flex items-center gap-6">
              <Avatar className="absolute h-15 w-15 border border-border">
                <AvatarImage src={displayAvatar} alt="Profile avatar" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-2 absolute left-24 translate-y-2.5">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    className="hidden"
                    onChange={handleAvatarSelection}
                  />

                  <Button
                    className="h-9 cursor-pointer bg-black text-white hover:bg-gray-800"
                    onClick={() => setIsAvatarDialogOpen(true)}
                    disabled={isAvatarSaving || isUploading}
                  >
                    {isAvatarSaving || isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "+ Change Image"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 cursor-pointer text-muted-foreground"
                    onClick={handleRemoveAvatar}
                    disabled={isAvatarSaving || isUploading}
                  >
                    Remove Image
                  </Button>
                </div>
                <p className="font-dmsans text-sm text-muted-foreground">
                  We support PNGs, JPEGs, GIFs and WebP under 2MB
                </p>
                {(avatarError || uploadError) && (
                  <p className="text-sm text-red-500">{avatarError || uploadError}</p>
                )}
                {avatarSuccess && (
                  <p className="text-sm text-emerald-600">{avatarSuccess}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={fName} className="font-dmsans" onChange={(e) => setFName(e.target.value)}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={lName} className="font-dmsans" onChange={(e) => setLName(e.target.value)}/>
              </div>
            </div>
            <Button
              variant='secondary'
              className="border border-border cursor-pointer"
              disabled={isNameSaving}
              onClick={handleNameChange}
            >
              {isNameSaving ? (
                <>  
                  <Loader2 className="mr-2" />
                  <span>Saving Changes...</span>
                </>
              ) : "Save Changes"}
            </Button>
          </section>

          <section className="mb-12">
            <h2 className="mb-6 text-xl font-serif font-semibold">Security</h2>

            <div className="space-y-6">
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    defaultValue={email}
                    disabled
                    className="bg-muted/50 font-dmsans text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    defaultValue="********"
                    disabled
                    className="cursor-pointer bg-muted/50 font-dmsans text-muted-foreground"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-[140px]"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  Change password
                </Button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-6 text-xl font-serif font-semibold">Danger Zone</h2>
            <div className="space-y-8 rounded-md border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Log out of all devices</Label>
                  <p className="mt-1 font-dmsans text-sm text-muted-foreground">
                    Log out of all other active sessions on other devices besides
                    this one.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSignOutOtherSessions}
                  disabled={isSigningOutOthers}
                >
                  {isSigningOutOthers ? "Logging out..." : "Log out"}
                </Button>

              </div>
              {sessionActionMessage && (
                <p className="text-sm font-dmsans text-muted-foreground">
                  {sessionActionMessage}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-dashed border-border pt-4">
                <div>
                  <Label className="text-base text-red-600">Delete my account</Label>
                  <p className="mt-1 font-dmsans text-sm text-muted-foreground">
                    Permanently delete the account and remove access from all
                    workspaces.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Change Password</DialogTitle>
            <DialogDescription className="font-dmsans">
              Enter your current password and a new secure password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordChange} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
              />
            </div>

            {passwordError && (
              <p className="text-sm font-medium text-red-500">{passwordError}</p>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                disabled={isPasswordLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-[140px] bg-orange-500 text-white hover:bg-orange-600"
                disabled={isPasswordLoading}
              >
                {isPasswordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Change Avatar</DialogTitle>
            <DialogDescription className="font-dmsans">
              Upload a new profile picture. We will save the full public URL on
              your account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border border-border" size="lg">
                <AvatarImage src={displayAvatar} alt="Avatar preview" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{displayName}</p>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                Choose a square image for the cleanest result. Supported types:
                PNG, JPEG, GIF, WebP.
              </p>
            </div>

            {(avatarError || uploadError) && (
              <p className="text-sm text-red-500">{avatarError || uploadError}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAvatarDialogOpen(false)}
              disabled={isAvatarSaving || isUploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAvatarSaving || isUploading}
            >
              {isAvatarSaving || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Choose Image
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog>
        
      </Dialog>
    </div>
  );
}
