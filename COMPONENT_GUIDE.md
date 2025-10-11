# 🎨 BugDex Component Guide

Quick reference for the implemented components.

---

## 🧭 BottomNav Component

### Usage
```tsx
import { BottomNav } from "@/components/BottomNav";

<BottomNav />
```

### Features
- **Fixed Position:** Always visible at bottom
- **Safe Area Support:** Works with iOS/Android notches
- **Three Sections:**
  1. Hamburger Menu (Sheet)
  2. Scan Button (Center, elevated)
  3. Settings (Dialog)

### Menu Items
```
☰ Hamburger Menu
  ├── 📚 My Collection
  ├── 🏆 Leaderboard
  ├── 👤 Profile
  ├── ℹ️ About
  └── 💼 Connect Wallet
```

### Settings Dialog
```
⚙️ Settings
  ├── Appearance (Theme toggle)
  ├── Notifications (Push settings)
  ├── Wallet (Manage wallet)
  └── About (Version + tokenomics)
```

---

## 🔍 ScanButton Component

### Usage
```tsx
import { ScanButton } from "@/components/ScanButton";

<ScanButton />
```

### Styling
- **Size:** 64x64px (h-16 w-16)
- **Shape:** Circular (rounded-full)
- **Colors:** Green-to-emerald gradient
- **Effects:** Hover scale + enhanced shadow

### Customization
```tsx
// Current gradient
className="bg-gradient-to-br from-green-500 to-emerald-600"

// Hover state
className="hover:from-green-600 hover:to-emerald-700 hover:scale-105"
```

---

## 🎨 Theme Colors

### Light Mode
```css
--background: oklch(1 0 0)           /* White */
--foreground: oklch(0.145 0 0)       /* Near black */
--primary: oklch(0.205 0 0)          /* Dark gray */
--accent: oklch(0.97 0 0)            /* Light gray */
```

### Dark Mode
```css
--background: oklch(0.145 0 0)       /* Dark */
--foreground: oklch(0.985 0 0)       /* Near white */
--primary: oklch(0.922 0 0)          /* Light gray */
--accent: oklch(0.269 0 0)           /* Medium gray */
```

---

## 📱 Responsive Breakpoints

```tsx
// Tailwind breakpoints
sm:   640px   // Small tablets
md:   768px   // Tablets
lg:   1024px  // Laptops
xl:   1280px  // Desktops
2xl:  1536px  // Large screens
```

### Example Usage
```tsx
// Sheet width
className="w-[300px] sm:w-[400px]"

// Padding adjustments
className="px-4 md:px-6 lg:px-8"
```

---

## 🔧 Icon Reference

All icons from **lucide-react**:

```tsx
import {
  Menu,        // ☰ Hamburger
  Settings,    // ⚙️ Settings
  Scan,        // 🔍 Scan
  BookOpen,    // 📚 Collection
  Trophy,      // 🏆 Leaderboard
  User,        // 👤 Profile
  Info,        // ℹ️ About
  Wallet,      // 💼 Wallet
} from "lucide-react";
```

### Icon Sizes
```tsx
// Standard size (nav/menu)
<Icon className="h-5 w-5" />

// Medium size (buttons)
<Icon className="h-6 w-6" />

// Large size (scan button)
<Icon className="h-8 w-8" />
```

---

## 🎯 Accessibility

### ARIA Labels
```tsx
// All interactive elements have labels
<Button aria-label="Open menu">
<Button aria-label="Scan Bug">
<Button aria-label="Open settings">
```

### Semantic HTML
```tsx
// Use semantic tags
<nav>    // Navigation
<main>   // Main content
<button> // Interactive elements
```

### Keyboard Navigation
- Tab through interactive elements
- Enter/Space to activate
- Escape to close modals

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
cd apps/web
pnpm install
```

### 2. Run Dev Server
```bash
pnpm dev
```

### 3. Open Browser
```
http://localhost:3000
```

### 4. Test Features
- Click hamburger menu → view navigation
- Click scan button → see console log
- Click settings → view settings dialog

---

## 📝 Adding New Menu Items

```tsx
// In BottomNav.tsx
<Button
  variant="ghost"
  className="w-full justify-start gap-3 h-12"
  onClick={() => {
    console.log("Navigate to NewPage");
    setSidebarOpen(false);
  }}
>
  <YourIcon className="h-5 w-5" />
  <span className="text-base">New Page</span>
</Button>
```

---

## 🎨 Customizing Scan Button

### Change Colors
```tsx
// Purple gradient
className="bg-gradient-to-br from-purple-500 to-pink-600"

// Blue gradient
className="bg-gradient-to-br from-blue-500 to-cyan-600"

// Gold gradient
className="bg-gradient-to-br from-yellow-500 to-orange-600"
```

### Change Size
```tsx
// Smaller
className="h-12 w-12"
<Icon className="h-6 w-6" />

// Larger
className="h-20 w-20"
<Icon className="h-10 w-10" />
```

---

## 🐛 Troubleshooting

### Issue: Nav bar not showing
**Solution:** Ensure `<BottomNav />` is in page.tsx or layout.tsx

### Issue: Safe area not working
**Solution:** Check viewport meta tag has `viewport-fit=cover`

### Issue: Theme not switching
**Solution:** Implement theme provider (next step)

### Issue: Icons not rendering
**Solution:** Check lucide-react is installed: `pnpm add lucide-react`

---

**Component Library:** shadcn/ui  
**Icons:** lucide-react  
**Framework:** Next.js 15 (App Router)  
**Styling:** Tailwind CSS v4
