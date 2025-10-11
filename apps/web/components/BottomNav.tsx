"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Menu, Settings, BookOpen, Trophy, User, Info, Wallet, Vote } from "lucide-react";
import { ScanButton } from "@/components/ScanButton";
import { WalletButton } from "@/components/WalletButton";

export function BottomNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border"
      style={{ 
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' 
      }}
    >
      <div className="flex items-center justify-between px-6 py-4 max-w-screen-xl mx-auto">
        {/* Left: Hamburger Menu */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="transition-colors hover:bg-accent"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>BugDex Menu</SheetTitle>
              <SheetDescription>
                Navigate through the app
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              {/* Navigation Menu Items */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={() => {
                  router.push("/collection");
                  setSidebarOpen(false);
                }}
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-base">My Collection</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={() => {
                  router.push("/voting");
                  setSidebarOpen(false);
                }}
              >
                <Vote className="h-5 w-5" />
                <span className="text-base">Vote on Bugs</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={() => {
                  router.push("/leaderboard");
                  setSidebarOpen(false);
                }}
              >
                <Trophy className="h-5 w-5" />
                <span className="text-base">Leaderboard</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={() => {
                  router.push("/profile");
                  setSidebarOpen(false);
                }}
              >
                <User className="h-5 w-5" />
                <span className="text-base">Profile</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={() => {
                  router.push("/about");
                  setSidebarOpen(false);
                }}
              >
                <Info className="h-5 w-5" />
                <span className="text-base">About</span>
              </Button>
              
              <div className="border-t border-border my-4" />
              
              {/* Wallet Connect Button */}
              <div className="px-2">
                <WalletButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Center: Scan Button */}
        <div className="-mt-8">
          <ScanButton />
        </div>

        {/* Right: Settings Icon */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="transition-colors hover:bg-accent"
              aria-label="Open settings"
            >
              <Settings className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Manage your BugDex preferences
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Settings Options */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Appearance</h3>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    console.log("Toggle theme");
                    // TODO: Implement theme toggle (light/dark mode)
                  }}
                >
                  Toggle Theme
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Notifications</h3>
                <div className="flex items-center justify-between">
                  <label htmlFor="notifications" className="text-sm text-muted-foreground">
                    Push notifications for new bugs
                  </label>
                  {/* TODO: Add Switch component from shadcn */}
                  <input type="checkbox" id="notifications" className="h-4 w-4" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Wallet</h3>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    console.log("Manage wallet");
                    // TODO: Add wallet management options
                  }}
                >
                  <Wallet className="h-4 w-4" />
                  Manage Connected Wallet
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">About</h3>
                <p className="text-xs text-muted-foreground">
                  BugDex v1.0.0 - ETHGlobal 2025
                </p>
                <p className="text-xs text-muted-foreground">
                  100 BUG = 1 PYUSD
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
}
