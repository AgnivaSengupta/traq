"use client";

import { useState } from "react";
import {
  Blocks,
  UserCircle,
  Bell,
  Globe,
  Settings,
  Users,
  CreditCard,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {authClient} from "@/lib/auth-client";
import { revokeOtherSessions } from "better-auth/api";
import { set } from "zod/v3";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";


export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Account");

  // Mock states for toggles
  const [twoStepAuth, setTwoStepAuth] = useState(true);
  const [supportAccess, setSupportAccess] = useState(true);
  
  
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [avatar, setAvatar] = useState<string>("");
  
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  
  
  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
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
    
    setIsLoading(true);
    
    try {
      const { data, error } = await authClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        revokeOtherSessions: true,
      });
      
      if (error) {
        setPasswordError(error.message || "Failed to change password");
        setIsLoading(false);
        return;
      }
      
      
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsPasswordDialogOpen(false);
    } catch (error) {
      setPasswordError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="flex flex-1 flex-col h-screen bg-background">
      {/* Top bar */}
      <header className="shrink-0 flex items-center gap-3 border-b border-border bg-card px-5 py-3">
        <span className="text-2xl font-serif tracking-wider ml-3">
          Settings
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden bg-background h-full w-full">
        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-[280px] shrink-0 border-r border-border bg-card flex flex-col pt-8 pb-4">

          <div className="flex-1 overflow-y-auto">
            {/* General Settings Group */}
            <div className="mb-8">
              <h3 className="px-8 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                General Settings
              </h3>
              <nav className="flex flex-col gap-1 px-4">
                <SidebarItem
                  icon={UserCircle}
                  label="Account"
                  isActive={activeTab === "Account"}
                  onClick={() => setActiveTab("Account")}
                />
                <SidebarItem
                  icon={Bell}
                  label="Notification"
                  isActive={activeTab === "Notification"}
                  onClick={() => setActiveTab("Notification")}
                />
                <SidebarItem
                  icon={Globe}
                  label="Language & Region"
                  isActive={activeTab === "Language & Region"}
                  onClick={() => setActiveTab("Language & Region")}
                />
              </nav>
            </div>

            {/* Workspace Settings Group */}
            <div>
              <h3 className="px-8 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Workspace Settings
              </h3>
              <nav className="flex flex-col gap-1 px-4">
                <SidebarItem
                  icon={Settings}
                  label="General"
                  isActive={activeTab === "General"}
                  onClick={() => setActiveTab("General")}
                />
                <SidebarItem
                  icon={Users}
                  label="Members"
                  isActive={activeTab === "Members"}
                  onClick={() => setActiveTab("Members")}
                />
                <SidebarItem
                  icon={CreditCard}
                  label="Billing"
                  isActive={activeTab === "Billing"}
                  onClick={() => setActiveTab("Billing")}
                />
              </nav>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 py-10 px-18 w-full overflow-y-auto">
          {/* Profile Section */}
          <section className="mb-12">
            <h3 className="text-xl font-serif font-semibold mb-6">
              My Profile
            </h3>

            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-muted overflow-hidden shrink-0 border border-border">
                {/* Placeholder for actual next/image */}
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Agniv"
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Button className="bg-black text-white hover:bg-gray-800 h-9 cursor-pointer" onClick={() => setIsAvatarDialogOpen(true)}>
                    + Change Image
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 text-muted-foreground cursor-pointer"
                  >
                    Remove Image
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground font-dmsans">
                  We support PNGs, JPEGs and GIFs under 2MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue="Agniva"
                  className="font-dmsans"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue="Sengupta"
                  className="font-dmsans"
                />
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="mb-12">
            <h3 className="text-xl font-serif font-semibold mb-6">
              Account Security
            </h3>

            <div className="space-y-6">
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    defaultValue="agniva@example.com"
                    disabled
                    className="bg-muted/50 text-muted-foreground font-dmsans"
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
                    className="bg-muted/50 text-muted-foreground font-dmsans cursor-pointer"
                  />
                </div>
                <Button variant="outline" className="w-[140px]" onClick={() => setIsPasswordDialogOpen(true)}>
                  Change password
                </Button>
              </div>

            </div>
          </section>

          {/* Support & Danger Section */}
          <section>
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Log out of all devices</Label>
                  <p className="text-sm text-muted-foreground font-dmsans mt-1">
                    Log out of all other active sessions on other devices
                    besides this one.
                  </p>
                </div>
                <Button variant="outline">Log out</Button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-dashed border-border">
                <div>
                  <Label className="text-base text-red-600">
                    Delete my account
                  </Label>
                  <p className="text-sm text-muted-foreground font-dmsans mt-1">
                    Permanently delete the account and remove access from all
                    workspaces.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
      
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
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    />
                  </div>
      
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    />
                  </div>
      
                  {/* Error Message Display */}
                  {passwordError && (
                    <p className="text-sm text-red-500 font-medium">{passwordError}</p>
                  )}
      
                  <DialogFooter className="pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsPasswordDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white w-[140px]" disabled={isLoading}>
                      {isLoading ? (
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
      
      
      <Dialog
        open={isAvatarDialogOpen}
        onOpenChange={setIsAvatarDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Avatar</DialogTitle>
            <DialogClose onClick={() => setIsAvatarDialogOpen(false)}></DialogClose>
          </DialogHeader>
          
          <form >
            {/*<input type="file" accept="image/*" />*/}
            
            <div className="w-full flex gap-2 items-center mt-4 mb-8">
            <div className="flex gap-2 justify-evenly items-center w-[80%] overflow-x-auto">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Agniva"
                alt="Profile Avatar"
                className="w-15 h-15 object-cover border border-border rounded-full bg-secondary"
              />
              
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ag"
                alt="Profile Avatar"
                className="w-15 h-15 object-cover border border-border rounded-full bg-secondary"
              />
              
              
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Agni"
                alt="Profile Avatar"
                className="w-15 h-15 object-cover border border-border rounded-full bg-secondary"
              />
              
              
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=A"
                alt="Profile Avatar"
                className="w-15 h-15 object-cover border border-border rounded-full bg-secondary"
              />
              
              </div>
            
              
              <div className="w-15 h-15 object-cover border border-border rounded-full bg-secondary flex justify-center items-center border-l-2 border-l-border">
                <Plus></Plus>
              </div>
            </div>
            
            
            <DialogFooter>
              <Button type="submit">Save Avatar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for the sidebar links
function SidebarItem({ icon: Icon, label, isActive, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
