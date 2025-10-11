"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Grid3x3, List, Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type Rarity = "common" | "rare" | "epic" | "legendary";
type BugType = "beetle" | "butterfly" | "mantis" | "dragonfly";

interface Bug {
  id: number;
  name: string;
  species: string;
  imageUrl: string;
  rarity: Rarity;
  type: BugType;
  foundDate: string;
  votes: number;
}

// Mock bug data - will be replaced with real NFT data from blockchain
const MOCK_BUGS: Bug[] = [
  {
    id: 1,
    name: "Emerald Beetle",
    species: "Chrysochroa fulgidissima",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop",
    rarity: "legendary",
    type: "beetle",
    foundDate: "2025-10-08",
    votes: 45,
  },
  {
    id: 2,
    name: "Monarch Butterfly",
    species: "Danaus plexippus",
    imageUrl: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=400&fit=crop",
    rarity: "rare",
    type: "butterfly",
    foundDate: "2025-10-09",
    votes: 38,
  },
  {
    id: 3,
    name: "Praying Mantis",
    species: "Mantis religiosa",
    imageUrl: "https://images.unsplash.com/photo-1568526381923-caf3fd520382?w=400&h=400&fit=crop",
    rarity: "epic",
    type: "mantis",
    foundDate: "2025-10-07",
    votes: 52,
  },
  {
    id: 4,
    name: "Ladybug",
    species: "Coccinellidae",
    imageUrl: "https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=400&h=400&fit=crop",
    rarity: "common",
    type: "beetle",
    foundDate: "2025-10-10",
    votes: 23,
  },
  {
    id: 5,
    name: "Blue Morpho",
    species: "Morpho menelaus",
    imageUrl: "https://images.unsplash.com/photo-1534189324936-e6d2320c8e94?w=400&h=400&fit=crop",
    rarity: "legendary",
    type: "butterfly",
    foundDate: "2025-10-05",
    votes: 67,
  },
  {
    id: 6,
    name: "Dragonfly",
    species: "Anisoptera",
    imageUrl: "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=400&h=400&fit=crop",
    rarity: "rare",
    type: "dragonfly",
    foundDate: "2025-10-06",
    votes: 41,
  },
];

type ViewMode = "grid" | "list";
type RarityFilter = "all" | Rarity;
type SortBy = "recent" | "rarity" | "votes";

const RARITY_COLORS: Record<Rarity, string> = {
  common: "bg-gray-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-amber-500",
};

const RARITY_LABELS: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export default function CollectionPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort bugs
  const filteredBugs = MOCK_BUGS
    .filter((bug) => {
      // Apply rarity filter
      if (rarityFilter !== "all" && bug.rarity !== rarityFilter) return false;
      
      // Apply search filter
      if (searchQuery && !bug.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !bug.species.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === "recent") {
        return new Date(b.foundDate).getTime() - new Date(a.foundDate).getTime();
      } else if (sortBy === "votes") {
        return b.votes - a.votes;
      } else if (sortBy === "rarity") {
        const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
        return rarityOrder[b.rarity as keyof typeof rarityOrder] - rarityOrder[a.rarity as keyof typeof rarityOrder];
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" aria-label="Back to home">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">My BugDex</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredBugs.length} bug{filteredBugs.length !== 1 ? "s" : ""} collected
                </p>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bugs by name or species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Rarity Filter */}
            <div className="flex gap-1">
              <Button
                variant={rarityFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setRarityFilter("all")}
              >
                All
              </Button>
              {Object.entries(RARITY_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  variant={rarityFilter === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRarityFilter(key as RarityFilter)}
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-1.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="recent">Recent First</option>
              <option value="rarity">By Rarity</option>
              <option value="votes">By Votes</option>
            </select>
          </div>
        </div>
      </header>

      {/* Bug Collection */}
      <main className="container mx-auto px-4 py-6">
        {filteredBugs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              {searchQuery || rarityFilter !== "all"
                ? "No bugs match your filters"
                : "No bugs collected yet"}
            </p>
            <Link href="/">
              <Button>Start Scanning</Button>
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBugs.map((bug) => (
              <BugCard key={bug.id} bug={bug} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBugs.map((bug) => (
              <BugListItem key={bug.id} bug={bug} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Bug Card Component (Grid View)
function BugCard({ bug }: { bug: Bug }) {
  return (
    <div className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
      {/* Image */}
      <div className="aspect-square bg-muted relative overflow-hidden">
        <img
          src={bug.imageUrl}
          alt={bug.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {/* Rarity Badge */}
        <div className={`absolute top-2 right-2 ${RARITY_COLORS[bug.rarity]} text-white text-xs font-semibold px-2 py-1 rounded-full`}>
          {RARITY_LABELS[bug.rarity]}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-1 truncate">{bug.name}</h3>
        <p className="text-xs text-muted-foreground mb-2 truncate italic">{bug.species}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>🗳️ {bug.votes} votes</span>
          <span>{new Date(bug.foundDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}

// Bug List Item Component (List View)
function BugListItem({ bug }: { bug: Bug }) {
  return (
    <div className="flex gap-4 bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <img
          src={bug.imageUrl}
          alt={bug.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{bug.name}</h3>
            <p className="text-sm text-muted-foreground truncate italic">{bug.species}</p>
          </div>
          <div className={`${RARITY_COLORS[bug.rarity]} text-white text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap`}>
            {RARITY_LABELS[bug.rarity]}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>🗳️ {bug.votes} votes</span>
          <span>📅 {new Date(bug.foundDate).toLocaleDateString()}</span>
          <span className="capitalize">🐛 {bug.type}</span>
        </div>
      </div>
    </div>
  );
}
