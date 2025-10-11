# 🐛 BugDex

> A Web3 mobile-first app for discovering and collecting bugs - built for EthGlobal

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=flat-square&logo=tailwindcss)
![ShadCN UI](https://img.shields.io/badge/ShadCN-UI-black?style=flat-square)

## 📖 About

**BugDex** is a Web3-powered bug collection application where users can scan, discover, and collect bugs in an interactive, gamified experience. Built with modern web technologies and optimized for mobile devices.

## ✨ Features

- 🎯 **Mobile-First Design** - Optimized for mobile viewing and interaction
- � **Camera Scanning** - Capture bugs with live camera or upload photos
- �📱 **Fixed Bottom Navigation** - Easy access to core features
- 🔍 **Prominent Scan Button** - Large, circular button with gradient styling
- 📚 **Collection View** - Grid/list view toggle with filters and search
- 🏆 **Leaderboard** - Top collectors ranking with stats
- 👤 **User Profile** - Stats, achievements, and activity feed
- ℹ️ **About Page** - Project info and tokenomics
- 🎨 **Modern UI** - Built with ShadCN UI components and Tailwind CSS
- 🌗 **Dark Mode Ready** - Supports light and dark themes
- ⚡ **Fast & Responsive** - Built with Next.js 15 and Turbopack
- 🎭 **Smooth Animations** - Polished transitions and hover effects
- 📱 **Mobile Safe-Area** - iOS/Android notch support

## 🏗️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.1](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- pnpm installed (`npm install -g pnpm`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd EthGlobal
   ```

2. **Navigate to the web app**
   ```bash
   cd apps/web
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
EthGlobal/
├── CAMERA_MODAL_DOCS.md      # Camera feature documentation
├── COLLECTION_PAGE_DOCS.md   # Collection page documentation
├── COMPONENT_GUIDE.md         # Component usage guide
├── FRONTEND_PROGRESS.md       # Development progress tracker
└── apps/
    └── web/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx              # Main homepage
        │   ├── globals.css
        │   ├── collection/
        │   │   └── page.tsx          # Bug collection view
        │   ├── leaderboard/
        │   │   └── page.tsx          # Top collectors ranking
        │   ├── profile/
        │   │   └── page.tsx          # User profile & stats
        │   └── about/
        │       └── page.tsx          # Project information
        ├── components/
        │   ├── ui/                   # ShadCN UI components
        │   │   ├── button.tsx
        │   │   ├── sheet.tsx
        │   │   └── dialog.tsx
        │   ├── BottomNav.tsx         # Bottom navigation bar
        │   ├── ScanButton.tsx        # Circular scan button
        │   └── CameraModal.tsx       # Camera scanning modal
        ├── lib/
        │   └── utils.ts
        └── package.json
```

## 🎨 Components

### BottomNav
The fixed bottom navigation bar includes:
- **Left**: Hamburger menu with navigation to Collection, Leaderboard, Profile, About
- **Center**: Large circular Scan button (opens camera modal)
- **Right**: Settings dialog with theme, notifications, and wallet options
- Fully functional navigation with Next.js routing

### ScanButton
A prominent, circular button with:
- Gradient green/emerald styling
- Scan icon from Lucide React
- Hover animations (scale + shadow)
- Opens CameraModal on click

### CameraModal
Full-featured camera scanning:
- Live camera access with auto-start
- Photo capture using Canvas API
- File upload fallback
- Image preview and review
- Submit for processing
- Error handling and permissions
- Click handler ready for bug scanning logic

## 🛠️ Available Scripts

```bash
# Development
pnpm dev          # Start dev server with Turbopack

# Production
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
```

## 📚 Documentation

Comprehensive documentation is available in the following files:

- **`FRONTEND_PROGRESS.md`** - Complete development progress and feature breakdown
- **`CAMERA_MODAL_DOCS.md`** - Camera scanning feature technical documentation
- **`COLLECTION_PAGE_DOCS.md`** - Collection page implementation details
- **`COMPONENT_GUIDE.md`** - Component usage reference and customization guide

These docs include implementation details, integration points, testing checklists, and future enhancement ideas.

## 🗺️ Roadmap

### ✅ Completed (Frontend Branch)
- [x] Mobile-first homepage layout
- [x] Camera scanning functionality with upload fallback
- [x] Bug collection page with grid/list views
- [x] Search and filtering system (rarity, type, date)
- [x] Leaderboard with top collectors
- [x] User profile with stats and achievements
- [x] About page with project info and tokenomics
- [x] Full navigation system
- [x] Mobile safe-area support
- [x] Comprehensive documentation

### 🔄 In Progress (Backend Integration)
- [ ] Web3 wallet connection (Privy/RainbowKit)
- [ ] Community voting system
- [ ] NFT minting integration
- [ ] IPFS image upload (Lighthouse)
- [ ] Smart contract integration
- [ ] Real-time data from blockchain

### 🎯 Future Enhancements
- [ ] Bug detail modal/page
- [ ] Trading functionality
- [ ] Dark mode toggle implementation
- [ ] Achievement unlock animations
- [ ] Social sharing features
- [ ] Push notifications
- [ ] PWA support

## 🎯 Pages

### Homepage (`/`)
- Welcome section with CTA
- Scan button for bug discovery
- Bottom navigation bar

### Collection (`/collection`)
- Grid and list view toggle
- Search by bug name or species
- Filter by rarity (Common, Rare, Epic, Legendary)
- Sort by recent, rarity, or votes
- 6 mock bugs with beautiful images

### Leaderboard (`/leaderboard`)
- Top 8 collectors ranking
- Medal system for top 3
- Stats: bugs collected, rare count, voting accuracy, BUG value
- User rank display
- Responsive layout

### Profile (`/profile`)
- User info with wallet address
- BUG token balance and PYUSD value
- Collection stats (bugs, votes, accuracy, rank)
- Achievement system (4 achievements)
- Recent activity feed
- Quick action buttons

### About (`/about`)
- Project overview
- How it works (4-step process)
- Tokenomics (100 BUG = 1 PYUSD)
- Key features showcase
- Tech stack information
- Team and ETHGlobal attribution

## 🌿 Branches

- **`main`** - Stable branch with base setup
- **`frontend`** - Active development branch with all UI features ⭐
- **`backend`** - Backend/smart contract development

> **Note:** The `frontend` branch contains the complete, demo-ready UI. Merge to `main` when ready for production.

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

Built with ❤️ for EthGlobal

---

⭐ Star this repo if you find it helpful!
