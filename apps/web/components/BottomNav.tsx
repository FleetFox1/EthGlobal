"use client";

import { useState } from "react";
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
import { Menu, Settings } from "lucide-react";
import { ScanButton } from "@/components/ScanButton";

export function BottomNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
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
            <div className="mt-6 space-y-4">
              {/* TODO: Add navigation menu items */}
              <p className="text-sm text-muted-foreground">
                Sidebar content goes here
              </p>
              {/* TODO: Add links to:
                  - Collection (view all bugs)
                  - Leaderboard (top collectors)
                  - Profile (user stats & wallet)
                  - About (project info & tokenomics)
              */}
              {/* TODO: Add Web3 wallet connect button here */}
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
            <div className="space-y-4 py-4">
              {/* TODO: Add settings options */}
              <p className="text-sm text-muted-foreground">
                Settings go here
              </p>
              {/* TODO: Add settings for:
                  - Notifications (push for new bugs)
                  - Camera permissions (for scanning)
                  - Theme toggle (light/dark mode)
                  - Wallet management (connect/disconnect)
                  - PYUSD payment preferences
                  - BUG token staking options
              */}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
}
