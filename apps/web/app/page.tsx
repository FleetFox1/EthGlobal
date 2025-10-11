import { BottomNav } from "@/components/BottomNav";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content Area */}
      <main className="pb-24 px-4 pt-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to BugDex
            </h1>
            <p className="text-lg text-muted-foreground">
              Your Web3 Bug Collection App
            </p>
            <div className="mt-8 p-8 border border-border rounded-lg bg-card">
              <p className="text-muted-foreground">
                Tap the <span className="font-semibold">Scan</span> button below to start
                discovering bugs!
              </p>
            </div>
          </div>
          
          {/* TODO: Add bug collection grid/list here */}
          {/* TODO: Display user's collected bugs as NFT cards */}
          {/* TODO: Show BUG token balance and PYUSD wallet integration */}
          
          {/* TODO: Add user stats/achievements */}
          {/* TODO: Display: Total bugs found, Rarity breakdown, Voting accuracy, BUG tokens earned */}
          
          {/* TODO: Add recent activity feed */}
          {/* TODO: Show: Recent scans, Community votes, New bugs discovered, Token transactions */}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
