# 📚 Collection Page - Documentation

## Overview
The Collection page displays all of a user's collected bug NFTs with powerful filtering, sorting, and view options. It's the showcase for their BugDex achievements!

---

## ✅ Features Implemented

### 1. **Dual View Modes**
- **Grid View:** Card-based layout (2-4 columns responsive)
- **List View:** Detailed row-based layout
- Toggle button in header for easy switching
- Smooth transition between views

### 2. **Search Functionality**
- Real-time search as you type
- Searches both bug name AND species
- Case-insensitive matching
- Clear visual feedback

### 3. **Rarity Filters**
- **All:** Show everything
- **Common:** Gray badge
- **Rare:** Blue badge
- **Epic:** Purple badge
- **Legendary:** Amber/gold badge
- Visual color coding for quick recognition

### 4. **Sorting Options**
- **Recent First:** Newest bugs appear first (default)
- **By Rarity:** Legendary → Epic → Rare → Common
- **By Votes:** Most community-approved first

### 5. **Bug Cards (Grid View)**
- Beautiful square images (aspect-square)
- Hover effects: scale + shadow
- Rarity badge overlay (top-right)
- Bug name + scientific species
- Vote count + date found
- Responsive: 2 cols mobile, 3 tablet, 4 desktop

### 6. **Bug List Items (List View)**
- Thumbnail image (80x80px)
- Full bug information visible
- Rarity badge
- Type, votes, date
- Better for detailed browsing

### 7. **Empty States**
- "No bugs collected yet" → Link to start scanning
- "No bugs match your filters" → When filtered
- Helpful CTAs to guide users

### 8. **Header**
- Back button to home
- Title + bug count
- View mode toggle (grid/list)
- Sticky header (scrolls with content)
- Backdrop blur effect

### 9. **Mock Data**
- 6 beautiful bug examples
- Real bug species names
- Variety of rarities
- High-quality Unsplash images
- Ready to be replaced with blockchain NFT data

---

## 🎨 Design System

### Color Coding
```tsx
Common    → bg-gray-500    (gray)
Rare      → bg-blue-500    (blue)
Epic      → bg-purple-500  (purple)
Legendary → bg-amber-500   (gold)
```

### Layout Breakpoints
```tsx
Mobile:   2 columns (grid)
Tablet:   3 columns (md:grid-cols-3)
Desktop:  4 columns (lg:grid-cols-4)
```

### Spacing
```tsx
Container:  px-4 (mobile), auto margins
Gap:        gap-4 (grid), gap-3 (list)
Padding:    pb-24 (space for bottom nav)
```

---

## 🔧 Technical Implementation

### Route Structure
```
/collection → app/collection/page.tsx
```

### State Management
```tsx
const [viewMode, setViewMode] = useState<ViewMode>("grid");
const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");
const [sortBy, setSortBy] = useState<SortBy>("recent");
const [searchQuery, setSearchQuery] = useState("");
```

### Type Definitions
```tsx
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
```

### Filtering Logic
```tsx
const filteredBugs = MOCK_BUGS
  .filter((bug) => {
    // Rarity filter
    if (rarityFilter !== "all" && bug.rarity !== rarityFilter) return false;
    
    // Search filter (name OR species)
    if (searchQuery && 
        !bug.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !bug.species.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  })
  .sort((a, b) => {
    // Sort by selected criteria
    if (sortBy === "recent") {
      return new Date(b.foundDate).getTime() - new Date(a.foundDate).getTime();
    } else if (sortBy === "votes") {
      return b.votes - a.votes;
    } else if (sortBy === "rarity") {
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    }
    return 0;
  });
```

---

## 🔗 Integration Points

### Current (Completed)
✅ **BottomNav** - "My Collection" menu item navigates here
✅ **Next.js Router** - Uses `useRouter` from `next/navigation`
✅ **Link component** - Back button and CTAs
✅ **Responsive design** - Works on all screen sizes

### TODO (Backend Integration)

**1. Replace Mock Data with NFT Data**
```tsx
// Fetch user's NFTs from blockchain
const { bugs, loading } = useUserBugs(walletAddress);

// Or from API endpoint
const response = await fetch(`/api/bugs/${walletAddress}`);
const bugs = await response.json();
```

**2. Add NFT Metadata**
```tsx
interface Bug {
  // ... existing fields
  tokenId: string;
  contractAddress: string;
  ownerAddress: string;
  mintedAt: number;
  ipfsUrl: string;
  attributes: {
    size: string;
    habitat: string;
    diet: string;
  };
}
```

**3. Trading Functionality**
```tsx
// Add trade button to each bug card
<Button onClick={() => initiateTradeflow}>
  Trade Bug
</Button>

// Open trading modal
<TradeModal 
  bug={selectedBug}
  onTrade={handleTrade}
/>
```

**4. Detail View / Modal**
```tsx
// Click on bug to see full details
onClick={() => router.push(`/bug/${bug.id}`)}

// Or open modal
onClick={() => setSelectedBug(bug)}
<BugDetailModal bug={selectedBug} />
```

**5. Stats Integration**
```tsx
// Show collection stats
Total Bugs: {bugs.length}
Complete Sets: {calculateSets(bugs)}
Rarest Bug: {findRarest(bugs)}
Total Value: {calculateValue(bugs)} BUG
```

---

## 📱 Responsive Behavior

### Mobile (< 640px)
- 2-column grid
- Full-width search bar
- Stacked filter buttons
- Compact card design

### Tablet (640px - 1024px)
- 3-column grid
- Wider search bar
- Inline filter row
- Larger cards

### Desktop (> 1024px)
- 4-column grid
- Max-width container
- Spacious layout
- Enhanced hover effects

---

## 🎨 Component Breakdown

### `CollectionPage`
Main page component that manages state and layout

### `BugCard`
```tsx
Props: { bug: Bug }
Features:
  - Square aspect ratio
  - Image with hover zoom
  - Rarity badge overlay
  - Truncated text
  - Vote count + date
```

### `BugListItem`
```tsx
Props: { bug: Bug }
Features:
  - Horizontal layout
  - 80x80px thumbnail
  - Full metadata visible
  - Better info density
```

---

## 🚀 Future Enhancements

### Phase 2
- [ ] Bug detail modal/page
- [ ] Trading interface
- [ ] Wishlist / favorites
- [ ] Collection statistics
- [ ] Achievement badges
- [ ] Share collection

### Phase 3
- [ ] Advanced filters (type, habitat, size)
- [ ] Tag system
- [ ] Custom collections/albums
- [ ] Bulk actions
- [ ] Export collection (PDF/image)
- [ ] Collection value calculator

### Phase 4
- [ ] 3D bug viewer
- [ ] AR bug display
- [ ] Collection slideshow
- [ ] Social features (compare collections)
- [ ] Rarity calculator
- [ ] Price history charts

---

## 🧪 Testing Checklist

### Navigation
- [x] Click "My Collection" in nav → Opens collection page
- [x] Click back button → Returns to home
- [x] Direct URL access works (`/collection`)

### View Modes
- [x] Grid view displays cards in responsive grid
- [x] List view displays rows
- [x] Toggle switches between views smoothly

### Search
- [x] Typing updates results in real-time
- [x] Matches bug names (e.g., "Emerald")
- [x] Matches species (e.g., "Chrysochroa")
- [x] Case-insensitive search works
- [x] Clear search shows all bugs

### Filters
- [x] "All" shows all bugs
- [x] Rarity filters work correctly
- [x] Active filter is visually highlighted
- [x] Multiple filters can be combined with search

### Sorting
- [x] "Recent First" sorts by date (newest first)
- [x] "By Rarity" sorts legendary → common
- [x] "By Votes" sorts highest → lowest

### Responsive
- [x] Mobile: 2 columns
- [x] Tablet: 3 columns
- [x] Desktop: 4 columns
- [x] Header stays visible on scroll
- [x] Bottom nav doesn't cover content

### Empty States
- [x] "No bugs yet" shows when no data
- [x] "No matches" shows when filtered out
- [x] CTAs link correctly

---

## 🎯 Performance Notes

### Optimizations
- Images use object-cover for consistent sizing
- Hover effects use CSS transforms (GPU-accelerated)
- Filter/sort happens client-side (fast)
- No unnecessary re-renders

### Future Optimizations
- Add image lazy loading
- Implement virtual scrolling for large collections
- Add pagination (load 20 at a time)
- Cache fetched NFT data
- Optimize images with Next.js Image component

---

## 🐛 Known Issues

### Current
- None! 🎉

### Potential
- **Large collections:** May be slow with 1000+ bugs (add pagination)
- **Image loading:** No loading states yet
- **No detail view:** Cards not clickable yet

### Workarounds
- Implement pagination for 50+ bugs
- Add skeleton loaders
- Add onClick handler to cards

---

## 📚 Related Components

- **BottomNav.tsx** - Navigation to collection
- **Button** (ui/button.tsx) - Filter and action buttons
- **Link** (next/link) - Navigation links

---

## 🔍 Code Location

```
apps/web/app/collection/
  └── page.tsx             ← Collection page (NEW)

apps/web/components/
  └── BottomNav.tsx        ← Updated with navigation
```

---

## 📊 Mock Data

### Bug Examples
1. **Emerald Beetle** (Legendary)
2. **Monarch Butterfly** (Rare)
3. **Praying Mantis** (Epic)
4. **Ladybug** (Common)
5. **Blue Morpho** (Legendary)
6. **Dragonfly** (Rare)

### Data Structure
```tsx
{
  id: 1,
  name: "Emerald Beetle",
  species: "Chrysochroa fulgidissima",
  imageUrl: "https://images.unsplash.com/...",
  rarity: "legendary",
  type: "beetle",
  foundDate: "2025-10-08",
  votes: 45,
}
```

---

**Status:** ✅ Complete  
**Next:** Voting UI or additional pages  
**Blockers:** None
