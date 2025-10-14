# Frontend Designer Guide - Bug Visualizations

## 🎨 Your Mission
The AI backend is complete and working! Your job is to create beautiful, educational visualizations for the identified bugs.

---

## 📊 Available Data

Every bug photo now has **AI-generated data** in the `bugInfo` object:

```typescript
interface BugInfo {
  commonName: string;           // "Jewel Bug"
  scientificName: string;        // "Scutelleridae"
  family: string;                // "Scutelleridae"
  order: string;                 // "Hemiptera"
  confidence: number;            // 0.95 (95%)
  distribution: string;          // "Tropical and subtropical regions worldwide"
  habitat: string;               // "Forests, gardens, and agricultural areas"
  diet: string;                  // "Plant sap"
  size: string;                  // "5-10mm"
  isDangerous: boolean;          // false
  dangerLevel: number;           // 0-10 scale
  conservationStatus: string;    // "Not evaluated"
  interestingFacts: string[];    // Array of 3 facts
  characteristics: {
    venom: number;               // 0-10
    biteForce: number;           // 0-10
    disease: number;             // 0-10
    aggression: number;          // 0-10
    speed: number;               // 0-10
  };
  lifespan: string;              // "Several months"
  rarity: string;                // "common" | "uncommon" | "rare" | "very rare"
}
```

---

## 🎯 Your Tasks

### 1. **Create BugDetailsModal Component**
**Location**: `apps/web/components/BugDetailsModal.tsx`

**When to show**: When user clicks on a bug photo in collection

**What to include**:
- Full-screen or large modal
- Hero image of the bug
- Animated reveal of information sections
- All visualizations below

---

### 2. **Threat Radar Chart** 🕷️
**Library**: Recharts (install with `pnpm add recharts`)

**Data to visualize**: `bugInfo.characteristics`
- Venom (0-10)
- Bite Force (0-10)
- Disease Risk (0-10)
- Aggression (0-10)
- Speed (0-10)

**Example**:
```tsx
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const data = [
  { characteristic: 'Venom', value: bugInfo.characteristics.venom },
  { characteristic: 'Bite Force', value: bugInfo.characteristics.biteForce },
  { characteristic: 'Disease', value: bugInfo.characteristics.disease },
  { characteristic: 'Aggression', value: bugInfo.characteristics.aggression },
  { characteristic: 'Speed', value: bugInfo.characteristics.speed },
];

<ResponsiveContainer width="100%" height={300}>
  <RadarChart data={data}>
    <PolarGrid />
    <PolarAngleAxis dataKey="characteristic" />
    <Radar 
      dataKey="value" 
      stroke="#8884d8" 
      fill="#8884d8" 
      fillOpacity={0.6} 
    />
  </RadarChart>
</ResponsiveContainer>
```

**Design Notes**:
- Red/orange gradient for dangerous bugs
- Green/blue for harmless bugs
- Add legend explaining the scale

---

### 3. **Size Comparison Visualization** 📏
**What**: Show bug size compared to familiar objects

**Data**: `bugInfo.size` (e.g., "5-10mm")

**Design Ideas**:
- Side-by-side comparison with:
  - Human hand silhouette
  - US penny (19mm)
  - Paperclip (50mm)
  - Grain of rice (7mm)
- Use CSS transforms to scale bug image
- Add ruler markings
- Animate the comparison on reveal

**Example Layout**:
```
[Bug Icon]  vs  [Penny Icon]
  5-10mm          19mm
```

---

### 4. **Habitat Map** 🗺️
**What**: Visual representation of where the bug lives

**Data**: 
- `bugInfo.distribution` (geographic range)
- `bugInfo.habitat` (environment type)
- User's location from `upload.location`

**Design Ideas**:
- World map with highlighted regions
- Icons for habitat types (forest 🌲, water 💧, desert 🏜️)
- "You found it here!" marker on map
- Use a library like `react-simple-maps` or just CSS/SVG

---

### 5. **Conservation Status Badge** 🛡️
**Data**: `bugInfo.conservationStatus`

**Statuses**:
- Least Concern → Green badge
- Near Threatened → Yellow badge
- Vulnerable → Orange badge
- Endangered → Red badge
- Critically Endangered → Dark red badge
- Not Evaluated → Gray badge

**Design**: Circular badge with icon + text

---

### 6. **Interesting Facts Carousel** 💡
**Data**: `bugInfo.interestingFacts` (array of 3 strings)

**Design Ideas**:
- Card-based carousel (swipe or arrow navigation)
- Each fact on a separate card
- Fun icons or illustrations
- Animated text reveal
- Use Framer Motion for smooth transitions

**Example**:
```tsx
import { motion } from 'framer-motion';

{bugInfo.interestingFacts.map((fact, index) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.2 }}
  >
    💡 {fact}
  </motion.div>
))}
```

---

### 7. **Info Cards Grid** 📋
**Layout**: 2x3 grid of stat cards

**Cards**:
1. **Lifespan** 🕐
   - `bugInfo.lifespan`
   - Icon: clock or hourglass
   
2. **Diet** 🍽️
   - `bugInfo.diet`
   - Icon: leaf (herbivore), meat (carnivore), both (omnivore)
   
3. **Habitat** 🏡
   - `bugInfo.habitat`
   - Icon: based on environment
   
4. **Size** 📏
   - `bugInfo.size`
   - Icon: ruler
   
5. **Rarity** ⭐
   - `bugInfo.rarity`
   - Color-coded badge (already implemented!)
   
6. **Danger Level** ⚠️
   - `bugInfo.dangerLevel`
   - Progress bar or star rating

**Design**: Use shadcn/ui Card component (already installed)

---

### 8. **Taxonomy Tree** 🌳
**What**: Show the bug's place in the classification hierarchy

**Data**:
- Kingdom: Animalia (assumed)
- Phylum: Arthropoda (assumed for bugs)
- Class: Insecta (assumed)
- Order: `bugInfo.order`
- Family: `bugInfo.family`
- Species: `bugInfo.scientificName`

**Design**: Vertical tree with connecting lines

---

### 9. **Wikipedia Integration** 📚
**API**: Free Wikipedia REST API

```typescript
async function getWikipediaInfo(scientificName: string) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName)}`;
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    title: data.title,
    description: data.extract,      // Short summary
    image: data.thumbnail?.source,   // Additional image
    url: data.content_urls.desktop.page,  // Link to full article
  };
}
```

**Display**:
- Show Wikipedia summary below AI facts
- Add "Read more on Wikipedia" link
- Show additional Wikipedia images in a gallery

---

## 🎨 Design System

### Colors
- **Common bugs**: Gray (#6B7280)
- **Uncommon**: Blue (#3B82F6)
- **Rare**: Yellow (#FBBF24)
- **Very Rare**: Purple (#A855F7)
- **Dangerous**: Red (#EF4444)
- **Safe**: Green (#10B981)

### Animations
- Use Framer Motion: `pnpm add framer-motion`
- Stagger animations for lists
- Smooth page transitions
- Loading skeleton for AI identification

### Typography
- Species names: Large, bold
- Scientific names: Italic, smaller
- Facts: Regular weight, readable

---

## 📱 Responsive Design

### Mobile (< 768px)
- Single column layout
- Stack visualizations vertically
- Swipeable carousels
- Collapsible sections

### Tablet (768px - 1024px)
- 2-column grid for info cards
- Side-by-side comparisons

### Desktop (> 1024px)
- Full layout with all visualizations visible
- Larger charts and maps
- Grid layouts for efficiency

---

## 🚀 Implementation Steps

### Phase 1: Basic Modal (1-2 hours)
1. Create `BugDetailsModal.tsx`
2. Add click handler to collection page cards
3. Display basic info (name, facts, size, diet)
4. Test with existing bug photos

### Phase 2: Charts (2-3 hours)
1. Install Recharts: `pnpm add recharts`
2. Create ThreatRadarChart component
3. Add size comparison visualization
4. Test with different bug types

### Phase 3: Maps & Badges (2-3 hours)
1. Add habitat map or illustration
2. Create conservation status badges
3. Design taxonomy tree
4. Test responsiveness

### Phase 4: Polish (1-2 hours)
1. Install Framer Motion: `pnpm add framer-motion`
2. Add animations and transitions
3. Wikipedia integration
4. Loading states
5. Error handling

---

## 📁 File Structure

```
apps/web/
├── components/
│   ├── BugDetailsModal.tsx          ← Main modal (YOU CREATE)
│   ├── bug-visualizations/
│   │   ├── ThreatRadarChart.tsx     ← Recharts radar (YOU CREATE)
│   │   ├── SizeComparison.tsx       ← Size viz (YOU CREATE)
│   │   ├── HabitatMap.tsx           ← Map/illustration (YOU CREATE)
│   │   ├── ConservationBadge.tsx    ← Status badge (YOU CREATE)
│   │   ├── FactsCarousel.tsx        ← Interesting facts (YOU CREATE)
│   │   └── InfoCards.tsx            ← Stat cards grid (YOU CREATE)
```

---

## 🎯 Goals

### Must Have:
- ✅ BugDetailsModal with basic info
- ✅ Threat radar chart
- ✅ Size comparison
- ✅ Interesting facts display

### Nice to Have:
- 🎨 Habitat map visualization
- 🎨 Animated transitions
- 🎨 Wikipedia integration
- 🎨 Taxonomy tree

### Stretch Goals:
- 🚀 3D bug model viewer
- 🚀 Sound effects for bugs
- 🚀 AR view (view bug in your space)
- 🚀 Compare two bugs side-by-side

---

## 💡 Inspiration

**Design References**:
- Pokédex UI from Pokémon games
- iNaturalist app
- National Geographic species pages
- Bug identification apps

**Color Palettes**:
- Earth tones for nature feel
- Bright accent colors for engagement
- Dark mode support

---

## 🧪 Testing

Test with these actual bugs from the system:
1. **Jewel Bug** (Scutelleridae) - 95% confidence
   - Common rarity
   - Low danger
   - Small size (5-10mm)

2. **Checkered Beetle** (Trichodes apiarius) - 90% confidence
   - Common rarity
   - Low danger
   - Medium size (7-15mm)

---

## 📦 Required Packages

```bash
# Install these:
pnpm add recharts
pnpm add framer-motion
pnpm add react-simple-maps  # Optional, for maps
```

---

## 🎨 Example: Complete Bug Details View

```
┌─────────────────────────────────────────────┐
│  [Close X]              BUG DETAILS         │
├─────────────────────────────────────────────┤
│                                             │
│         [LARGE BUG IMAGE]                   │
│                                             │
│  🐛 Jewel Bug                               │
│  Scutelleridae                              │
│  [Common] [Safe] [AI: 95%]                  │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  💡 INTERESTING FACTS                       │
│  ┌───────────────────────────────────────┐ │
│  │ • Known for iridescent colors         │ │
│  │ • Often mistaken for beetles          │ │
│  │ • Warning coloration                  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  📊 THREAT ASSESSMENT                       │
│  [Radar Chart Here]                         │
│                                             │
│  📏 SIZE COMPARISON                         │
│  [Visual comparison with penny]             │
│                                             │
│  ℹ️ QUICK FACTS                            │
│  ┌──────┐ ┌──────┐ ┌──────┐               │
│  │Lifespan│ │ Diet  │ │Habitat│              │
│  │Several │ │Plant  │ │Forests│              │
│  │months  │ │sap    │ │Gardens│              │
│  └──────┘ └──────┘ └──────┘               │
│                                             │
│  🗺️ FOUND IN                               │
│  [World map with highlighted regions]       │
│                                             │
│  📚 LEARN MORE                              │
│  [Wikipedia summary]                        │
│  [Read more on Wikipedia →]                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

**Ready to create amazing bug visualizations! 🐛🎨**

All the data is already there - just make it beautiful! 🚀
